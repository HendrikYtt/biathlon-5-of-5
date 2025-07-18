import { NextResponse, NextRequest } from 'next/server';
import {
	getLeagueByName,
	getLeaguesByProfileId,
	insertLeague,
	LeagueToInsertRequest
} from '@/app/api/features/league/database';
import {createClient} from '@/libs/supabase/server';
import {generateLeaguePassword} from '@/libs/utils';

// this disables static optimization and caching
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	try {
		const supabase = createClient();
		const user = await supabase.auth.getUser();
		const leagues = await getLeaguesByProfileId(user.data.user.id);
		return NextResponse.json(leagues);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const leagueToInsertReq: LeagueToInsertRequest = await req.json();
		const existingLeague = await getLeagueByName(leagueToInsertReq.name);
		if (existingLeague.length > 0) {
			return NextResponse.json({ error: 'League already exists' }, { status: 400 });
		}
		const pw = generateLeaguePassword();
		const supabase = createClient();
		const user = await supabase.auth.getUser();
		const inserted = await insertLeague({
			...leagueToInsertReq,
			profile_ids: [user.data.user.id],
			owner_profile_id: user.data.user.id,
			password: pw
		});

		return NextResponse.json(inserted.data);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
