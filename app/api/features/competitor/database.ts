import {DbCompetitor} from '@/types/types';
import {createClient} from '@/libs/supabase/server';

export const getCompetitors = async () => {
	const supabase = createClient();
	return supabase.from('competitor').select('*');
};

export type CompetitorToInsert = Omit<DbCompetitor, 'created_at' | 'updated_at'>;
export const insertCompetitor = async (competitorToInsert: CompetitorToInsert) => {
	const supabase = createClient();
	return supabase.from('competitor').insert(competitorToInsert).select();
};

export const deleteCompetitor = async (competitorIbuId: string) => {
	const supabase = createClient();
	return supabase.from('competitor').delete().eq('ibu_id', competitorIbuId).select();
};

export const upsertCompetitor = async (competitorsToInsert: CompetitorToInsert[]) => {
	const supabase = createClient();
	return supabase.from('competitor').upsert(competitorsToInsert, {onConflict: 'ibu_id'}).select();
};