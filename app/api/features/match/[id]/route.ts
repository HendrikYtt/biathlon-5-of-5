import {NextRequest, NextResponse} from 'next/server';
import {deleteMatch} from '@/app/api/features/match/database';
import {insertMarkets} from '@/app/api/features/market/database';
import {marketTypes} from '@/app/api/features/market-type/market-types';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: 'Match id is required' }, { status: 400 });
	}

	try {
		// await insertMarkets(
		// 	marketTypes.map(mt => {
		// 		return {
		// 			name: mt.name,
		// 			options_to_choose_from_for_user: mt.optionsForUser,
		// 			market_type_id: mt.id,
		// 			result: null,
		// 			match_id: +id,
		// 		};
		// 	})
		// );
		//
		// return NextResponse.json({message: 'ok'});

		const result = await deleteMatch(parseInt(id));

		return NextResponse.json(result.data);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}