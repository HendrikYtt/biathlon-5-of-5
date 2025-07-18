import { NextResponse, NextRequest } from 'next/server';
import {
	deleteLeague
} from '@/app/api/features/league/database';

// this disables static optimization and caching
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: 'League id is required' }, { status: 400 });
	}

	try {
		const inserted = await deleteLeague(parseInt(id));

		return NextResponse.json(inserted.data);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
