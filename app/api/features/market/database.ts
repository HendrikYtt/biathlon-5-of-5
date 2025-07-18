import {DbMarket} from '@/types/types';
import {createClient} from '@/libs/supabase/server';
import {doQuery} from '@/app/api/database';

export type MarketToInsert = Omit<DbMarket, 'id' | 'created_at' | 'updated_at'>;
export const insertMarkets = async (marketsToInsert: MarketToInsert[]) => {
	const supabase = createClient();
	return supabase.from('market').insert(marketsToInsert).select();
};

export const deleteMarket = async (marketId: number) => {
	const supabase = createClient();
	return supabase.from('market').delete().eq('id', marketId).select();
};

export type MarketToUpdate = Partial<DbMarket>;
export async function updateMarket(marketToUpdate: MarketToUpdate, isTest: boolean) {
	const { id, ...fieldsToUpdate } = marketToUpdate;

	if (!id) {
		throw new Error('Id must be provided for market update');
	}

	const setClause = Object.keys(fieldsToUpdate)
		.map((key, index) => `${key} = $${index + 2}`)
		.join(', ');

	const query = `
    UPDATE public.market
    SET ${setClause}
    WHERE id = $1
    RETURNING *;
    `;

	const params = [id, ...Object.values(fieldsToUpdate)];

	const result = await doQuery(query, params, isTest);
	if (result.length === 0) {
		throw new Error(`No market found with id ${id}`);
	}
	return result[0];
}

export async function getMarketsByMatchId(matchId: number, isTest: boolean): Promise<DbMarket[]> {
	const query = `
    SELECT *
    FROM public.market
    WHERE match_id = $1;
    `;
	const params = [matchId];
	return await doQuery(query, params, isTest);
}