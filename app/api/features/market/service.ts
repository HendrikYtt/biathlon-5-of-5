import {insertMarkets} from '@/app/api/features/market/database';

export const insertDefaultMarkets = async (matchId: number, isTeam: boolean) => {
	if (isTeam) {
		await insertMarkets([
			{
				name: 'I',
				match_id: matchId,
				result: null,
				market_type_id: 1,
				options_to_choose_from_for_user: 'Team'
			},
			{
				name: 'II',
				match_id: matchId,
				result: null,
				market_type_id: 2,
				options_to_choose_from_for_user: 'Team'
			},
			{
				name: 'III',
				match_id: matchId,
				result: null,
				market_type_id: 3,
				options_to_choose_from_for_user: 'Team'
			}
		]);
	} else {
		await insertMarkets([
			{
				name: 'I',
				match_id: matchId,
				result: null,
				market_type_id: 26,
				options_to_choose_from_for_user: 'Competitor'
			},
			{
				name: 'II',
				match_id: matchId,
				result: null,
				market_type_id: 27,
				options_to_choose_from_for_user: 'Competitor'
			},
			{
				name: 'III',
				match_id: matchId,
				result: null,
				market_type_id: 28,
				options_to_choose_from_for_user: 'Competitor'
			}
		]);
	}
};