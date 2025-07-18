import {createClient} from '@/libs/supabase/server';
import {DbLeague} from '@/types/types';
import {doQuery} from '@/app/api/database';

export const getLeagueByPassword = async (password: string) => {
	return await doQuery(`
        SELECT *
        FROM league 
        WHERE password = $1
        ORDER BY created_at DESC;
    `, [password]);
};

export const getLeagueByName = async (name: string) => {
	return await doQuery(`
        SELECT *
        FROM league 
        WHERE name = $1
        ORDER BY created_at DESC;
    `, [name]);
};

export const getLeaguesByProfileId = async (profileId: string): Promise<DbLeague[]> => {
	return await doQuery(`
        SELECT *
        FROM league 
        WHERE $1 = ANY(profile_ids)
        ORDER BY created_at DESC;
    `, [profileId]);
};

export type LeagueToInsert = Omit<DbLeague, 'id' | 'created_at' | 'updated_at'>;
export type LeagueToInsertRequest = Omit<LeagueToInsert, 'password' | 'profile_ids' | 'owner_profile_id'>;
export const insertLeague = async (leagueToInsert: LeagueToInsert) => {
	const supabase = createClient();
	return supabase.from('league').insert(leagueToInsert).select();
};

export type JoinLeagueRequest = {
	password: string
}
export const addProfileIdToLeague = async (profileId: string, leagueId: number) => {
	const result = await doQuery(
		'SELECT profile_ids FROM league WHERE id = $1',
		[leagueId]
	);

	const currentProfileIds = result[0].profile_ids || [];
	const updatedProfileIds = Array.from(new Set([...currentProfileIds, profileId]));

	return await doQuery(
		`
        UPDATE league 
        SET profile_ids = $1
        WHERE id = $2
        RETURNING *;
        `,
		[updatedProfileIds, leagueId]
	);
};


export const deleteLeague = async (leagueId: number) => {
	const supabase = createClient();
	return supabase.from('league').delete().eq('id', leagueId).select();
};