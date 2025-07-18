import {createClient} from '@/libs/supabase/server';
import {Category, DbCategory} from '@/types/types';
import {doQuery} from '@/app/api/database';
import {marketTypes} from '@/app/api/features/market-type/market-types';

export const getCategories = async () => {
	const categories: Category[] = await doQuery(`
    SELECT
      c.id,
      c.name,
      c.location,
      c.start_time,
      c.created_at,
      c.updated_at,
      c.is_active,
      COALESCE(m.matches, '[]') AS matches
    FROM
      public.category c
    LEFT JOIN LATERAL (
      SELECT
        json_agg(
          json_build_object(
            'id', m.id,
            'name', m.name,
            'biathlon_race_id', m.biathlon_race_id,
            'gender', m.gender,
            'is_team', m.is_team,
            'start_time', m.start_time,
            'created_at', m.created_at,
            'updated_at', m.updated_at,
            'markets', COALESCE(mk.markets, '[]')
          )
	  	ORDER BY m.start_time
        ) AS matches
      FROM
        public.match m
      LEFT JOIN LATERAL (
        SELECT
          json_agg(
            json_build_object(
              'id', mk.id,
              'match_id', mk.match_id,
              'name', mk.name,
              'options_to_choose_from_for_user', mk.options_to_choose_from_for_user,
              'result', mk.result,
              'market_type_id', mk.market_type_id,
              'created_at', mk.created_at,
              'updated_at', mk.updated_at
            )
          ) AS markets
        FROM
          public.market mk
        WHERE
          mk.match_id = m.id
      ) mk ON true
      WHERE
        m.category_id = c.id
    ) m ON true
    ORDER BY
      c.start_time;
  `);
	const categoriesWithMarketTypes: Category[] = categories.map(c => {
		return {
			...c,
			matches: c.matches.map(m => {
				return {
					...m,
					markets: m.markets.map(market => {
						const marketType = marketTypes.find(mt => mt.id === market.market_type_id);
						return {
							...market,
							market_type: marketType
						};
					})
				};
			})
		};
	});

	return categoriesWithMarketTypes;
};

export type CategoryToInsert = Omit<DbCategory, 'id' | 'created_at' | 'updated_at'>;
export const insertCategory = async (categoryToInsert: CategoryToInsert) => {
	const supabase = createClient();
	return supabase.from('category').insert(categoryToInsert).select();
};

export const upsertCategory = async (categoryToInsert: CategoryToInsert) => {
	const supabase = createClient();
	return supabase
		.from('category')
		.upsert(categoryToInsert, { onConflict: 'biathlon_event_id' })
		.select();
};

export type UpdateCategoryIsActive = Pick<DbCategory, 'id' | 'is_active'>;
export const updateCategoryIsActive = async (req: UpdateCategoryIsActive) => {
	const {is_active, id} = req;
	const supabase = createClient();
	return supabase
		.from('category')
		.update({ is_active: is_active })
		.eq('id', id)
		.select();
};

export const deleteCategory = async (categoryId: number) => {
	const supabase = createClient();
	return supabase.from('category').delete().eq('id', categoryId).select();
};