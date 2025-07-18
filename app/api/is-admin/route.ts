import { NextResponse, NextRequest } from 'next/server';
import {createClient} from '@/libs/supabase/server';
import {getProfileByEmail} from '@/app/api/is-admin/database';
import {DbProfile} from '@/types/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const supabase = createClient();
	const user = await supabase.auth.getUser();
	const res = await getProfileByEmail(user.data.user.email);
	const profile: DbProfile = res.data;
	return NextResponse.json({isAdmin: profile ? profile.is_admin : false});
}
