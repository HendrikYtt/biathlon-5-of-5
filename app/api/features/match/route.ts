import {NextRequest, NextResponse} from 'next/server';
import {insertMatch, MatchToInsert} from '@/app/api/features/match/database';

export async function POST(req: NextRequest) {
	try {
		const matchToInsert: MatchToInsert = await req.json();
		const inserted = await insertMatch(matchToInsert);

		return NextResponse.json(inserted.data);
	} catch (e) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}