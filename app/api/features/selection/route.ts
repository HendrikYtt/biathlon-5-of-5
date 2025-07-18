import {NextRequest, NextResponse} from 'next/server';
import {
	upsertSelections,
	SelectionToInsert, checkConflictingSelections, decorateSelections, getSelectionsCount
} from '@/app/api/features/selection/database';
import {prioritizedIds, specialMtGroups} from '@/app/api/features/market-type/const';


export async function POST(req: NextRequest) {
	try {
		const {selectionsToInsert, matchId}: {selectionsToInsert: SelectionToInsert[], matchId: number} = await req.json();
		const decorated = await decorateSelections(selectionsToInsert);
		const marketTypeIdToGroup: Record<number, string> = Object.entries(specialMtGroups).reduce((map, [groupKey, ids]) => {
			ids.forEach((id) => {
				map[id] = groupKey;
			});
			return map;
		}, {} as Record<number, string>);

		const grouped = decorated.reduce<
			Record<string, { market_type_ids: number[]; selections: ({ market_type_id: number } & SelectionToInsert)[] }>
				>((acc, selection) => {
					const isSpecialGroup = ['competitor-26-28', 'country-1-3'].includes(marketTypeIdToGroup[selection.market_type_id]);
					const baseGroupKey = marketTypeIdToGroup[selection.market_type_id] || `other-${selection.market_type_id}`;
					const groupKey = isSpecialGroup ? `${baseGroupKey}-${selection.result_key}` : baseGroupKey;
					if (!acc[groupKey]) {
						acc[groupKey] = {
							market_type_ids: specialMtGroups[baseGroupKey] || [selection.market_type_id],
							selections: [],
						};
					}
					acc[groupKey].selections.push(selection);
					return acc;
				}, {});

		const hasDuplicateSelections = Object.values(grouped).some(group => group.selections.length > 1);
		if (hasDuplicateSelections) {
			throw new Error('Can\'t have duplicate selections');
		}

		if (decorated.some(d => prioritizedIds.includes(d.market_type_id))) {
			const exists = await checkConflictingSelections(decorated, matchId);
			if (exists.length) {
				throw new Error('Can\'t have duplicate selections');
			}
		}
		const upserted = await upsertSelections(selectionsToInsert, false);

		return NextResponse.json(upserted);
	} catch (e) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		const selectionsCount = await getSelectionsCount();
		return NextResponse.json(selectionsCount[0]);
	} catch (e) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
