import {createClient} from '@/libs/supabase/server';

export const getProfileByEmail = async (email: string) => {
	const supabase = createClient();
	return supabase.from('profiles').select('*').eq('email', email).single();
};