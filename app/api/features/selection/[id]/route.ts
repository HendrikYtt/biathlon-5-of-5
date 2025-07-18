import {NextRequest, NextResponse} from 'next/server';
import {
	upsertSelections,
	SelectionToInsert, getSelections, checkConflictingSelections, decorateSelections
} from '@/app/api/features/selection/database';
import {prioritizedIds, specialMtGroups} from '@/app/api/features/market-type/const';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: 'League id is required' }, { status: 400 });
	}
	try {
		const selections = await getSelections(parseInt(id));
		return NextResponse.json(selections);
	} catch (e) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
