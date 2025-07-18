import {DbMatch} from '@/types/types';
import {createClient} from '@/libs/supabase/server';
import {doQuery} from '@/app/api/database';

export type MatchToInsert = Omit<DbMatch, 'id' | 'created_at' | 'updated_at'>;
export const insertMatch = async (matchToInsert: MatchToInsert) => {
	const supabase = createClient();
	return supabase.from('match').insert(matchToInsert).returns<DbMatch>().select();
};

export const upsertMatch = async (matchToInsert: MatchToInsert) => {
	const supabase = createClient();
	return supabase.from('match').upsert(matchToInsert, {onConflict: 'biathlon_race_id'}).returns<DbMatch>().select();
};

export const deleteMatch = async (matchId: number) => {
	const supabase = createClient();
	return supabase.from('match').delete().eq('id', matchId).returns<DbMatch>().select();
};

export async function getMatchByBiathlonRaceId(biathlonRaceId: string, isTest: boolean) {
	const query = `
    SELECT *
    FROM public.match
    WHERE biathlon_race_id = $1
    LIMIT 1;
    `;
	const params = [biathlonRaceId];
	const result = await doQuery(query, params, isTest);
	return result[0];
}