import {NextRequest, NextResponse} from 'next/server';
import {getCompetitors, insertCompetitor, CompetitorToInsert} from '@/app/api/features/competitor/database';

export async function POST(req: NextRequest) {
	try {
		const competitorToInsert: CompetitorToInsert = await req.json();
		const inserted = await insertCompetitor(competitorToInsert);

		return NextResponse.json(inserted.data);
	} catch (e) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		const competitors = await getCompetitors();
		return NextResponse.json(competitors.data);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
