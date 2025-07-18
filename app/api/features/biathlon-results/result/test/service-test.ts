import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { resultMatch } from '@/app/api/features/biathlon-results/service';
import { doQuery } from '@/app/api/database';
import {CategoryToInsert} from '@/app/api/features/category/database';
import {MatchToInsert} from '@/app/api/features/match/database';
import {MarketToInsert} from '@/app/api/features/market/database';
import {DbMatch, Gender, OptionsToChooseFromForUser} from '@/types/types';
import {createClient} from '@/libs/supabase/server';
import {SelectionToInsert, upsertSelections} from '@/app/api/features/selection/database';

type TestCase = {
	name: string;
	setupAndAssert: (name: string) => void;
}

const teamBiathlonRaceId = 'BT2324SWRLCP01MXSR';
const womenBiathlonRaceId = 'BT2324SWRLCP01SWIN';
const womenBiathlonLappedRaceId = 'BT2425SWRLCP04SWPU';

const testCases: TestCase[] = [
	{
		name: 'I koht (Riik)',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Team';
			const {match, testProfile1, testProfile2, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 1
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'SWEDEN',
				points: null
			});
			const partiallyCorrectSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile2.id,
				type: type,
				result_key: 'NORWAY',
				points: null
			});
			const undefinedSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: 'Team',
				result_key: 'NARNIA',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const partiallyCorrect = await getTestSelectionByMarketIdAndProfileId(partiallyCorrectSelection.market_id, partiallyCorrectSelection.profile_id);
			const undefinedS = await getTestSelectionByMarketIdAndProfileId(undefinedSelection.market_id, undefinedSelection.profile_id);
			if (correctS.points !== 3 || partiallyCorrect.points !== 1 || undefinedS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mitmendale kohale tuleb Tuuli?',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile2, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 4
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '33',
				points: null
			});
			const partiallyCorrectSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile2.id,
				type: type,
				result_key: '34',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: 'PositiveNumber',
				result_key: '69',
				points: null
			});

			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const partiallyCorrectS = await getTestSelectionByMarketIdAndProfileId(partiallyCorrectSelection.market_id, partiallyCorrectSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 3 || partiallyCorrectS.points !== 3 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mitmendale kohale tuleb Eesti?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile2, testProfile3} = await insertTestData('X', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 5
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '14',
				points: null
			});
			const partiallyCorrectSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile2.id,
				type: type,
				result_key: '15',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: 'PositiveNumber',
				result_key: '16',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const partiallyCorrectS = await getTestSelectionByMarketIdAndProfileId(partiallyCorrectSelection.market_id, partiallyCorrectSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 3 || partiallyCorrectS.points !== 3 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Vähim Trahve (Riik)',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Team';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 6
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'FINLAND',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'ESTONIA',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Vähim Trahve (Võistleja)',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 7
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'PREUSS Franziska',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'VITTOZZI Lisa',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mahavõetute Arv (Riigid)',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 8
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '3',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '9',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mahavõetute Arv (Võistlejad)',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonLappedRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 9
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '3',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '5',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Parim võistleja Baltikumist',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 10
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'KUELM Susan',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'BULINA Sanita',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Parim võistleja koht Baltikumist',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 11
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '18',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '69',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 3 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Tuuli Trahvide Arv',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 12
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '2',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '69',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Nulli Lasknud',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 13
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '4',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '69',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Avavahetuse Võitja (Riik)',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Team';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 14
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'AUSTRIA',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'NORWAY',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Kiireim Vahetus (Võistleja)',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 15
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'SAMUELSSON Sebastian',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'ERMITS Regina',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'LAEGREID Sturla Holm Varupadrunid',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 16
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '1',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '2',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'TOP3 Trahvide Summa',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 17
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '1',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '2',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Tuuli Koha Muutus',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 18
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '-7',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '2',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 3 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Tuuli Lõppkoht',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 19
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '33',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '2',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 3 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Paremuselt 5. Norrakas',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 21
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'ARNEKLEIV Juni',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'KNOTTEN Karoline Offigstad',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Norralaste Trahvid Kokku',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 22
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '9',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '4',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Tuuli Kaotus Võitjale',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'NumberRange15';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 23
			});

			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '+03:45 to +03:59',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '+04:00 to +04:14',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Parim Rossignoli võistleja',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 24
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'PREUSS Franziska',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'VITTOZZI Lisa',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'I koht (Võistleja)',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile2, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 26
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'VITTOZZI Lisa',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'TOMINGAS Tuuli',
				points: null
			});
			const partiallyCorrectSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile2.id,
				type: type,
				result_key: 'PREUSS Franziska',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const partiallyCorrectS = await getTestSelectionByMarketIdAndProfileId(partiallyCorrectSelection.market_id, partiallyCorrectSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 3 || partiallyCorrectS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mitu Eesti sportlast lõpetab TOP40?',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 30
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '2',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '0',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Kes on parim mitte norralane?',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile3} = await insertTestData('W', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 32
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'VITTOZZI Lisa',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'PREUSS Franziska',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Kas Eesti koht finisis on kõrgem kui stardinumber?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'ThreeWay';
			const {match, testProfile1, testProfile3} = await insertTestData('X', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 33
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'JAH',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'EI',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mitu trahviringi sõidab Eesti?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('X', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 34
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '0',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '2',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mitu riiki jõuab üle finišijoone?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('X', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 35
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '21',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '22',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Milline riik sõidab enim trahviringe?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Team';
			const {match, testProfile1, testProfile3} = await insertTestData('X', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 36
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'FRANCE',
				points: null
			});

			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'ESTONIA',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Parim Baltikumi riik?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Team';
			const {match, testProfile1, testProfile3} = await insertTestData('X', false, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 37
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'ESTONIA',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'LATVIA',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Kõige kiirem teise vahetuse läbija',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 38
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'OEBERG Hanna',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'SIMON Julia',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);
			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Parim trahviringil käinud võistkonna koht?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Number';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 40
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '4',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '1',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 3 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mitu varupadrunit kasutab Saksamaa?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Number';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 44
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '7',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '1',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mitu Madshuse sportlast on poodiumil?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Number';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 45
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '1',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '0',
				points: null
			});
			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Eesti kaotus liidrile pärast avavahetust?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'NumberRange15';
			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 47
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '+00:15 to +00:29',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '+00:00 to +00:14',
				points: null
			});

			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Kui palju kaotab teine koht finišis esimesele?',
		setupAndAssert: async (name: string) => {
			const raceId = teamBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'NumberRange15';

			const {match, testProfile1, testProfile3} = await insertTestData('X', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 48
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '+00:00 to +00:14',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '+00:15 to +00:29',
				points: null
			});

			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mitu sek kaotab parim eestlane võitjale?',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'NumberRange15';
			const {match, testProfile1, testProfile3} = await insertTestData('W', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 49
			});

			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '+02:30 to +02:44',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '+02:15 to +02:29',
				points: null
			});

			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mitu trahviringi sõidavad OEBERG Elvira ja OEBERG Hanna kokku?',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'PositiveNumber';
			const {match, testProfile1, testProfile3} = await insertTestData('W', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 51
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '9',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '6',
				points: null
			});

			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Kes on kõige kiirem rajal (ainult sõiduaeg ilma tiiruta)?',
		setupAndAssert: async (name: string) => {
			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile3} = await insertTestData('W', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 53
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: 'OEBERG Elvira',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: 'TOMINGAS Tuuli',
				points: null
			});

			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 1 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Parim eestlase koht finisis',
		setupAndAssert: async (name: string) => {

			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile3} = await insertTestData('W', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 43
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '15',
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '14',
				points: null
			});

			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 3 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
	{
		name: 'Mis kohal lõpetab paremuselt neljas norralane?',
		setupAndAssert: async (name: string) => {

			const raceId = womenBiathlonRaceId;
			const type: OptionsToChooseFromForUser = 'Competitor';
			const {match, testProfile1, testProfile3} = await insertTestData('W', true, raceId);
			const market = await insertTestMarket({
				match_id: match.id,
				name: name,
				options_to_choose_from_for_user: type,
				result: null,
				market_type_id: 50
			});
			const correctSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile1.id,
				type: type,
				result_key: '13', // correct is 10, but +-3 place
				points: null
			});
			const wrongSelection = await insertTestSelection({
				market_id: market.id,
				profile_id: testProfile3.id,
				type: type,
				result_key: '14',
				points: null
			});

			await resultMatch(raceId, true);
			const correctS = await getTestSelectionByMarketIdAndProfileId(correctSelection.market_id, correctSelection.profile_id);
			const wrongS = await getTestSelectionByMarketIdAndProfileId(wrongSelection.market_id, wrongSelection.profile_id);

			if (correctS.points !== 3 || wrongS.points !== 0) {
				throw new Error(`${name} FAILED!`);
			}
		},
	},
];

export const resultTest = async (testCaseName: string): Promise<void> => {
	if (testCaseName) {
		const {name, setupAndAssert} = testCases.find(t => t.name === testCaseName);
		console.log(name);
		await beforeEach();
		await setupAndAssert(name);
		await afterEach();
	} else {
		for (let testCase of testCases) {
			const {name, setupAndAssert} = testCase;
			console.log(name);
			await beforeEach();
			await setupAndAssert(name);
			await afterEach();
		}
	}
};

const insertTestData = async (gender: Gender, isTeam: boolean, biathlonRaceId: string) => {
	const testProfile1 = await insertTestProfile();
	const testProfile2 = await insertTestProfile();
	const testProfile3 = await insertTestProfile();

	const category = await insertTestCategory({
		name: 'BMW IBU World Cup Biathlon',
		location: 'Oestersund',
		start_time: '2023-11-22 12:00:00+00',
		biathlon_event_id: 'BT2324SWRLCP01',
		is_active: true
	});
	const match = await insertTestMatch({
		category_id: category.id,
		name: 'Single Mixed Relay (M+W)',
		start_time: '2023-11-25 11:30:00+00',
		biathlon_race_id: biathlonRaceId,
		gender: gender,
		is_team: isTeam
	});
	return {testProfile1, testProfile2, testProfile3, category, match};
};

export async function insertTestCategory(data: CategoryToInsert) {
	const query = `
    INSERT INTO category (name, location, start_time, biathlon_event_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (biathlon_event_id) DO UPDATE
    SET name = EXCLUDED.name, location = EXCLUDED.location, start_time = EXCLUDED.start_time
    RETURNING *;
    `;
	const params = [data.name, data.location, data.start_time, data.biathlon_event_id];
	const result = await doQuery(query, params, true);
	return result[0];
}

export async function insertTestMatch(data: MatchToInsert) {
	const query = `
    INSERT INTO match (category_id, name, start_time, biathlon_race_id, gender, is_team)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (biathlon_race_id) DO UPDATE
    SET category_id = EXCLUDED.category_id, name = EXCLUDED.name, start_time = EXCLUDED.start_time,
        gender = EXCLUDED.gender, is_team = EXCLUDED.is_team
    RETURNING *;
    `;
	const params = [data.category_id, data.name, data.start_time, data.biathlon_race_id, data.gender, data.is_team];
	const result = await doQuery(query, params, true);
	return result[0];
}

export async function insertTestMarket(data: MarketToInsert) {
	const query = `
    INSERT INTO market (match_id, name, options_to_choose_from_for_user, result, market_type_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `;
	const params = [data.match_id, data.name, data.options_to_choose_from_for_user, data.result, data.market_type_id];
	const result = await doQuery(query, params, true);
	return result[0];
}

export async function getTestSelectionByMarketIdAndProfileId(marketId: number, profileId: string) {
	const query = `
    SELECT *
    FROM selection
    WHERE market_id = $1 AND profile_id = $2;
    `;
	const params = [marketId, profileId];
	const result = await doQuery(query, params, true);
	return result[0];
}

export async function insertTestSelection(data: SelectionToInsert) {
	const query = `
    INSERT INTO selection (market_id, profile_id, type, result_key, points)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (market_id, profile_id) DO UPDATE
    SET type = EXCLUDED.type, result_key = EXCLUDED.result_key, points = EXCLUDED.points
    RETURNING *;
    `;
	const params = [data.market_id, data.profile_id, data.type, data.result_key, data.points];
	const result = await doQuery(query, params, true);
	return result[0];
}

export async function insertTestProfile() {
	const query = `
    INSERT INTO profiles (id, name, email, image, customer_id, price_id, has_access, is_admin)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
    `;

	const params = [
		crypto.randomUUID(),
		'Hendrik',
		'hendrik.utt@gmail.com',
		'IMAGE URL',
		'stripe_customer_id',
		'stripe_price_id',
		false,
		true
	];

	const result = await doQuery(query, params, true);
	return result[0];
}

const beforeEach = async () => {
	try {
		await doQuery('CREATE DATABASE testing');
	} catch (e) {
		console.log('db already exists');
	}

	await doQuery(`
	CREATE TABLE public.profiles (
		id UUID PRIMARY KEY,
		name TEXT,
		email TEXT,
		image TEXT,
		customer_id TEXT,
		price_id TEXT,
		has_access BOOLEAN DEFAULT false,
		is_admin BOOLEAN DEFAULT false,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
	);	
	`, [], true);

	const sqlFiles = await readSqlFiles('../../../../../../supabase/migrations');

	for (const file of sqlFiles) {
		await doQuery(file.content, [], true);
	}
};

export const afterEach = async () => {
	await doQuery('SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = \'testing\' AND pid <> pg_backend_pid();');
	await doQuery('DROP DATABASE IF EXISTS testing');
};

async function readSqlFiles(directory: string): Promise<{ name: string; content: string }[]> {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const migrationsPath = path.join(__dirname, directory);

	const files = await fs.readdir(migrationsPath);
	const sqlFiles = files.filter(file => {
		return file.endsWith('.sql') && !file.includes('profiles');
	});

	return Promise.all(sqlFiles.map(async (file) => {
		const filePath = path.join(migrationsPath, file);
		const content = await fs.readFile(filePath, 'utf-8');
		return { name: file, content };
	}));
}