import {DbSelection} from '@/types/types';
import {createClient} from '@/libs/supabase/server';
import {doQuery} from '@/app/api/database';
import {keyBy} from 'lodash';
import {podiumPlacesCompetitorMtIds, podiumPlacesCountryMtIds} from '@/app/api/features/market-type/const';

export type SelectionWithExtra = DbSelection & {
	email: string;
	user_profile_id: string;
	username: string;
	user_country: string;
	user_favorite_athlete: string;
	market_name: string;
	market_result: string | null;
	market_type_id: number;
	match_name: string;
	match_start_time: string;
	location: string;
	category_name: string;
	category_start_time: string;
	category_id: number;
};

export const getSelections = async (leagueId: number) => {
	const resp: SelectionWithExtra[] = await doQuery(`
		SELECT
			s.*,
			p.email,
			p.id AS user_profile_id,
			p.username AS username,
			p.country AS user_country,
			p.favorite_athlete AS user_favorite_athlete,
			m.name AS market_name,
			m.result AS market_result,
			m.market_type_id AS market_type_id,
			ma.name AS match_name,
			ma.start_time AS match_start_time,
			c.location AS location,
			c.name AS category_name,
			c.start_time AS category_start_time,
			c.id AS category_id
		FROM public.selection s
		FULL JOIN public.profiles p ON p.id = s.profile_id
		LEFT JOIN public.market m ON m.id = s.market_id
		LEFT JOIN public.match ma ON ma.id = m.match_id
		LEFT JOIN public.category c ON c.id = ma.category_id
		WHERE p.id = ANY (
			SELECT UNNEST(profile_ids)::UUID
			FROM league
			WHERE id = $1
		)
		ORDER BY 
			CASE
				WHEN m.market_type_id = 1 THEN 1
				WHEN m.market_type_id = 2 THEN 2
				WHEN m.market_type_id = 3 THEN 3
				WHEN m.market_type_id = 26 THEN 4
				WHEN m.market_type_id = 27 THEN 5
				WHEN m.market_type_id = 28 THEN 6
				ELSE 7
			END,
			m.market_type_id;
	`, [leagueId]);
	return resp;
};

export const getSelectionsForProfile = async (profileId: string) => {
	const supabase = createClient();
	return supabase
		.from('selection')
		.select()
		.eq('profile_id', profileId);
};

export type SelectionToInsert = Omit<DbSelection, 'created_at' | 'updated_at'>;
export async function upsertSelections(selectionsToInsert: SelectionToInsert[], isTest: boolean) {
	const query = `
    INSERT INTO public.selection (market_id, profile_id, type, result_key, points)
    VALUES ${selectionsToInsert.map((_, index) =>
		`($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`
	).join(', ')}
    ON CONFLICT (profile_id, market_id) DO UPDATE
    SET type = EXCLUDED.type, 
        result_key = EXCLUDED.result_key, 
        points = EXCLUDED.points
    RETURNING *;
    `;
	const params = selectionsToInsert.flatMap(s => [s.market_id, s.profile_id, s.type, s.result_key, s.points]);
	return await doQuery(query, params, isTest);
}

export const checkConflictingSelections = async (selectionsToInsert: ({market_type_id: number} & SelectionToInsert)[], matchId: number) => {
	const query = `
        SELECT *
        FROM selection s
        JOIN market m ON m.id = s.market_id
        JOIN match ma ON ma.id = m.match_id
        WHERE 
            s.profile_id = ANY($1)
            AND s.result_key = ANY($2)
            AND m.market_type_id IN (${[...podiumPlacesCountryMtIds, ...podiumPlacesCompetitorMtIds].map(mtId => mtId).join(', ')})
            AND ma.id = $3;
    `;

	const profileIds = selectionsToInsert.map(s => s.profile_id);
	const resultKeys = selectionsToInsert.map(s => s.result_key);

	const params = [profileIds, resultKeys, matchId];

	return await doQuery(query, params);
};

export const decorateSelections = async (selectionsToInsert: SelectionToInsert[]) => {
	const query = `
        SELECT *
        FROM market m
		WHERE m.id IN (${selectionsToInsert.map(s => s.market_id).join(', ')})
    `;
	const resp = await doQuery(query);
	const byMarketId = keyBy(resp, x => x.id);

	console.log(resp);
	const decorated = selectionsToInsert.map(s => {
		return {
			...s,
			market_type_id: byMarketId[s.market_id]?.market_type_id,
		};
	});
	return decorated;
};

export async function getSelectionsByMarketId(marketId: number, isTest: boolean) {
	const query = `
    SELECT *
    FROM public.selection
    WHERE market_id = $1;
    `;
	const params = [marketId];
	return await doQuery(query, params, isTest);
}

export async function getSelectionsCount() {
	const profiles = await doQuery(`
		SELECT COUNT(*)
		FROM public.selection
	`);
	return profiles;
}

export const deleteSelectionsByMarketId = async (marketId: number) => {
	const query = `
    DELETE
    FROM public.selection
    WHERE market_id = $1;
    `;
	const params = [marketId];
	return await doQuery(query, params);
};