import {NextRequest, NextResponse} from 'next/server';
import {
	getSelectionsForProfile,
} from '@/app/api/features/selection/database';
import {createClient} from '@/libs/supabase/server';

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');
		const supabase = createClient();
		const user = await supabase.auth.getUser();
		const selections = await getSelectionsForProfile(userId || user.data.user.id);
		return NextResponse.json(selections.data);
	} catch (e) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
