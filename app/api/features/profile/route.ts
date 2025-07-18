import {NextRequest, NextResponse} from 'next/server';
import {
	getProfileByUsername,
	getProfiles,
	updateProfileUserInfo,
	UserInfoToInsert
} from '@/app/api/features/profile/database';
import {addProfileIdToLeague} from '@/app/api/features/league/database';
import {createClient} from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
	try {
		const userInfo: UserInfoToInsert = await req.json();
		const existingProfile = await getProfileByUsername(userInfo.username);
		if (existingProfile.length > 0 && userInfo.id !== existingProfile[0].id) {
			return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
		}
		const supabase = createClient();
		const user = await supabase.auth.getUser();
		await addProfileIdToLeague(user.data.user.id, 1);
		const inserted = await updateProfileUserInfo(userInfo);

		return NextResponse.json(inserted.data);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		const profiles = await getProfiles();
		return NextResponse.json(profiles);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
