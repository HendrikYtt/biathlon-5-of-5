import { NextResponse, NextRequest } from 'next/server';
import {
	addProfileIdToLeague,
	JoinLeagueRequest, getLeagueByPassword
} from '@/app/api/features/league/database';
import {createClient} from '@/libs/supabase/server';

// this disables static optimization and caching
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	try {
		const request: JoinLeagueRequest = await req.json();
		const {password} = request;

		const leagues = await getLeagueByPassword(password);
		if (!leagues.length) {
			return NextResponse.json({ error: 'Password is incorrect' }, { status: 404 });
		}

		const supabase = createClient();
		const user = await supabase.auth.getUser();
		const inserted = await addProfileIdToLeague(user.data.user.id, leagues[0].id);

		return NextResponse.json(inserted);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
