import {NextRequest, NextResponse} from 'next/server';
import {deleteMarket} from '@/app/api/features/market/database';
import {deleteSelectionsByMarketId} from '@/app/api/features/selection/database';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: 'Market id is required' }, { status: 400 });
	}

	try {
		const result = await deleteMarket(parseInt(id));
		await deleteSelectionsByMarketId(result.data[0].id);

		return NextResponse.json(result.data);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}