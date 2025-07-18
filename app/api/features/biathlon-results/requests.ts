import nodeFetch from 'node-fetch';
import {Competition, CompetitorResponse, Event, ResultResponse} from '@/app/api/features/biathlon-results/types';

const baseUrl = 'https://www.biathlonresults.com/modules/sportapi/api';

export const getEvents = async (seasonId: string): Promise<Event[]> => {
	const response = await nodeFetch(`${baseUrl}/Events?SeasonId=${seasonId}`, {
		method: 'GET'
	});
	const events = await response.json() as unknown as Event[];
	return events;
};

export const getCompetitions = async (eventId: string): Promise<Competition[]> => {
	const response = await nodeFetch(`${baseUrl}/Competitions?EventId=${eventId}`, {
		method: 'GET'
	});
	const competitions = await response.json() as unknown as Competition[];
	return competitions;
};

export const getResults = async (raceId: string): Promise<ResultResponse> => {
	const response = await nodeFetch(`${baseUrl}/Results?RaceId=${raceId}`, {
		method: 'GET'
	});
	const results = await response.json() as unknown as ResultResponse;
	return results;
};

export const getCompetitor = async (ibuId: string): Promise<CompetitorResponse> => {
	const response = await nodeFetch(`${baseUrl}/CISBios?IBUId=${ibuId}`, {
		method: 'GET'
	});
	const competitor = await response.json() as unknown as CompetitorResponse;
	return competitor;
};

export type AnalysisType = 'Total Course Time' | 'Total Range Time' | 'Total Shooting Time';
type ShortAnalysisType = 'CRST' | 'RNGT' | 'STTM';

const analysisMappings: Record<AnalysisType, ShortAnalysisType> = {
	'Total Course Time': 'CRST',
	'Total Range Time': 'RNGT',
	'Total Shooting Time': 'STTM'
};

export const getResultsAnalysis = async (raceId: string, analysisType: AnalysisType) => {
	const response = await nodeFetch(`${baseUrl}/AnalyticResults?RaceId=${raceId}&TypeId=${analysisMappings[analysisType]}`, {
		method: 'GET'
	});
	const results = await response.json() as unknown as ResultResponse;
	return results;
};