import {
	getCompetitions,
	getCompetitor,
	getEvents,
	getResults,
	getResultsAnalysis
} from '@/app/api/features/biathlon-results/requests';
import {upsertCategory} from '@/app/api/features/category/database';
import {getMatchByBiathlonRaceId, upsertMatch} from '@/app/api/features/match/database';
import {DbCompetitor, DbSelection, Gender} from '@/types/types';
import {getMarketsByMatchId, updateMarket} from '@/app/api/features/market/database';
import {getCompetitors, upsertCompetitor} from '@/app/api/features/competitor/database';
import { map as bluebirdMap } from 'bluebird';
import {getSelectionsByMarketId, SelectionToInsert, upsertSelections} from '@/app/api/features/selection/database';
import {keyBy} from 'lodash';
import {marketTypes} from '@/app/api/features/market-type/market-types';
import {insertDefaultMarkets} from '@/app/api/features/market/service';
import {Result} from '@/app/api/features/biathlon-results/types';

type BiathlonResultsGender = 'SM' | 'SW' | 'MX' | 'JM' | 'JW' | 'YM' | 'YW' | 'BM' | 'GW' | 'JX' | 'YX'
const genderMapping: Record<BiathlonResultsGender, Gender> = {
	SW: 'W',
	SM: 'M',
	MX: 'X',
	JM: 'M',
	JW: 'W',
	YM: 'M',
	YW: 'W',
	BM: 'M',
	GW: 'W',
	JX: 'X',
	YX: 'X'
};

export type DisciplineId = 'SR' | 'RL' | 'MS' | 'PU' | 'SP';

export const massStartDiscipline = 'MS';
export const pursuitDiscipline = 'PU';
export const sprintDiscipline = 'SP';

export const TeamCompetitionDisciplines = ['SR', 'RL'];
const seniorCats = ['SW', 'SM', 'MX'];

export const createCompetitionsAndEvents = async (seasonId: string) => {
	const events = await getEvents(seasonId);
	for (const event of events) {
		if (event.Description.includes('Youth') || event.Description.includes('Junior')) {
			continue;
		}
		const insertedCategory = await upsertCategory({
			name: event.Description,
			location: event.Organizer,
			biathlon_event_id: event.EventId,
			start_time: event.StartDate,
			is_active: true
		});
		const competitions = await getCompetitions(event.EventId);
		for (const competition of competitions) {
			if (!seniorCats.includes(competition.catId)) {
				continue;
			}
			const isTeam = TeamCompetitionDisciplines.includes(competition.DisciplineId);
			const resp = await upsertMatch({
				name: competition.ShortDescription,
				start_time: competition.StartTime,
				biathlon_race_id: competition.RaceId,
				category_id: insertedCategory.data[0].id,
				gender: genderMapping[competition.catId as BiathlonResultsGender],
				is_team: isTeam
			});
			const matchId = resp.data[0].id;
			await insertDefaultMarkets(matchId, isTeam);

			if (resp.error) {
				console.log('===wtff', competition.catId);
			}
		}
	}
};

export const resultMatch = async (biathlonRaceId: string, isTest: boolean) => {
	const match = await getMatchByBiathlonRaceId(biathlonRaceId, isTest);

	const markets = await getMarketsByMatchId(match.id, isTest);
	const resultsResp = await getResults(biathlonRaceId);
	const results = resultsResp.Results;
	if (!results?.length || results?.length === 0) {
		throw new Error('Biathlon results API returned no results for this match');
	}
	const selectionsToUpsert: SelectionToInsert[] = [];
	let dbCompetitors: DbCompetitor[] = [];
	for (const market of markets) {
		const mtId = market.market_type_id;
		const marketType = marketTypes.find(mt => mt.id === mtId);
		const selections: DbSelection[] = await getSelectionsByMarketId(market.id, isTest);
		const selectionsByProfileIdAndMarketId = keyBy(selections, item => `${item.profile_id}_${item.market_id}`);

		let resultsToUse: Result[] = [];
		if (marketType.needsAnalysis) {
			const resultsResp = await getResultsAnalysis(biathlonRaceId, marketType.analysisType);
			resultsToUse = resultsResp.Results;
		} else {
			resultsToUse = results;
		}

		let formulaRes;
		if (marketType.needsCompetitors) {
			if (!dbCompetitors.length) {
				const res = await getCompetitors();
				dbCompetitors = res.data;
			}
			formulaRes = marketType.formula(resultsToUse, selectionsByProfileIdAndMarketId, dbCompetitors);
		} else if (marketType.needsDiscipline){
			formulaRes = marketType.formula(resultsToUse, selectionsByProfileIdAndMarketId, [], resultsResp.Competition.DisciplineId as DisciplineId);
		} else {
			formulaRes = marketType.formula(resultsToUse, selectionsByProfileIdAndMarketId);
		}

		await updateMarket({
			id: market.id,
			result: formulaRes.resultKeys.join(', ').toString()
		}, isTest);
		if (!selections.length) {
			continue;
		}
		const toInserts: SelectionToInsert[] = selections.map(s => {
			return {
				result_key: s.result_key,
				type: s.type,
				points: formulaRes.pointsByProfileIdAndMarketId[`${s.profile_id}_${s.market_id}`],
				profile_id: s.profile_id,
				market_id: s.market_id
			};
		});
		selectionsToUpsert.push(...toInserts);

	}
	await upsertSelections(selectionsToUpsert, isTest);
};

export const importCompetitors = async (seasonId: string) => {
	console.log(`Starting import for season ${seasonId}`);
	const events = await getEvents(seasonId);
	console.log(`Found ${events.length} events`);

	let processedEvents = 0;
	let totalCompetitors = 0;
	const competitorCache = new Map();

	const cachedGetCompetitor = async (IBUId: string) => {
		if (competitorCache.has(IBUId)) {
			return competitorCache.get(IBUId);
		}
		const competitorResp = await getCompetitor(IBUId);
		competitorCache.set(IBUId, competitorResp);
		return competitorResp;
	};

	await bluebirdMap(events, async (event) => {
		const competitions = await getCompetitions(event.EventId);
		const seniorCompetitions = competitions.filter(competition => seniorCats.includes(competition.catId));

		await bluebirdMap(seniorCompetitions, async (competition) => {
			const resultsResp = await getResults(competition.RaceId);

			const competitorsToUpsert = await bluebirdMap(resultsResp.Results, async (result) => {
				const competitorResp = await cachedGetCompetitor(result.IBUId);
				return {
					name: result.Name,
					gender: competitorResp.GenderId as Gender,
					ibu_id: result.IBUId,
					is_team: result.IsTeam,
					extra_data: competitorResp
				};
			}, { concurrency: 50 });  // Process 50 competitors concurrently

			await upsertCompetitor(competitorsToUpsert);
			totalCompetitors += competitorsToUpsert.length;
		}, { concurrency: 5 });  // Process 5 competitions concurrently

		processedEvents++;
		console.log(`Processed event ${processedEvents}/${events.length}: ${event.EventId}`);
	}, { concurrency: 2 });  // Process 2 events concurrently

	console.log(`Import completed. Processed ${processedEvents} events and ${totalCompetitors} competitors.`);
	console.log(`Unique competitors fetched: ${competitorCache.size}`);
};