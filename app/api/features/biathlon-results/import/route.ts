import {NextRequest, NextResponse} from 'next/server';
import {importCompetitors} from '@/app/api/features/biathlon-results/service';

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		await importCompetitors(body.seasonId);
		return NextResponse.json({message: 'ok'});
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}