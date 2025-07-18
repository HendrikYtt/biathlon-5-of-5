import {NextRequest, NextResponse} from 'next/server';
import {insertMarkets, MarketToInsert, MarketToUpdate, updateMarket} from '@/app/api/features/market/database';

export async function POST(req: NextRequest) {
	try {
		const marketToInsert: MarketToInsert = await req.json();
		const inserted = await insertMarkets([marketToInsert]);

		return NextResponse.json(inserted.data);
	} catch (e) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const marketToUpdate: MarketToUpdate = await req.json();
		const updated = await updateMarket(marketToUpdate, false);

		return NextResponse.json(updated);
	} catch (e) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}