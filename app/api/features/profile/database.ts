import {createClient} from '@/libs/supabase/server';
import {DbProfile} from '@/types/types';
import {doQuery} from '@/app/api/database';

export const getProfileByUsername = async (username: string) => {
	return await doQuery(`
        SELECT *
        FROM profiles 
        WHERE username = $1
        ORDER BY created_at DESC;
    `, [username]);
};

export type UserInfoToInsert = Pick<DbProfile, 'id' | 'username' | 'country' | 'favorite_athlete'>;
export const updateProfileUserInfo = async (userInfoToInsert: UserInfoToInsert) => {
	const supabase = createClient();
	return supabase.from('profiles').update(userInfoToInsert).eq('id', userInfoToInsert.id).select('*');
};

export const getProfiles = async () => {
	return await doQuery(`
        SELECT *
        FROM profiles 
    `);
};
