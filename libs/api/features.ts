import apiClient from '@/libs/api/config';
import {Category, DbCompetitor, DbLeague, DbProfile, DbSelection} from '@/types/types';
import {CategoryToInsert, UpdateCategoryIsActive} from '@/app/api/features/category/database';
import {MatchToInsert} from '@/app/api/features/match/database';
import {MarketToInsert} from '@/app/api/features/market/database';
import {CompetitorToInsert} from '@/app/api/features/competitor/database';
import {SelectionToInsert, SelectionWithExtra} from '@/app/api/features/selection/database';
import {JoinLeagueRequest, LeagueToInsertRequest} from '@/app/api/features/league/database';
import {UserInfoToInsert} from '@/app/api/features/profile/database';

const baseUrl = '/features';
const categoryUrl = `${baseUrl}/category`;
const matchUrl = `${baseUrl}/match`;
const marketUrl = `${baseUrl}/market`;
const competitorUrl = `${baseUrl}/competitor`;
const selectionUrl = `${baseUrl}/selection`;
const biathlonResultsUrl = `${baseUrl}/biathlon-results`;
const leagueUrl = `${baseUrl}/league`;
const profileUrl = `${baseUrl}/profile`;

// CATEGORY
export const getCategories = async (): Promise<Category[]> => {
	return await apiClient.get(categoryUrl);
};

export const addCategory = async (categoryToInset: CategoryToInsert) => {
	return await apiClient.post(categoryUrl, categoryToInset);
};

export const deleteCategory = async (categoryIdToDelete: number) => {
	return await apiClient.delete(`${categoryUrl}/${categoryIdToDelete}`);
};

export const updateCategoryIsActive = async (req: UpdateCategoryIsActive) => {
	return await apiClient.patch(`${categoryUrl}`, req);
};

// MATCH
export const addMatch = async (matchToInsert: MatchToInsert) => {
	return await apiClient.post(matchUrl, matchToInsert);
};

export const deleteMatch = async (matchIdToDelete: number) => {
	return await apiClient.delete(`${matchUrl}/${matchIdToDelete}`);
};

// MARKET
export const addMarket = async (marketToInsert: MarketToInsert) => {
	return await apiClient.post(marketUrl, marketToInsert);
};

export const deleteMarket = async (marketIdToDelete: number) => {
	return await apiClient.delete(`${marketUrl}/${marketIdToDelete}`);
};

// COMPETITOR
export const getCompetitors = async (): Promise<DbCompetitor[]> => {
	return await apiClient.get(competitorUrl);
};

export const addCompetitor = async (competitorToInsert: CompetitorToInsert) => {
	return await apiClient.post(competitorUrl, competitorToInsert);
};

export const deleteCompetitor = async (ibuIdToDelete: string): Promise<void> => {
	return await apiClient.delete(`${competitorUrl}/${ibuIdToDelete}`);
};

// SELECTION
export const getSelections = async (leagueId: number): Promise<SelectionWithExtra[]> => {
	return await apiClient.get(`${selectionUrl}/${leagueId}`);
};

export const getSelectionsForProfile = async (userId: string | null): Promise<DbSelection[]> => {
	return await apiClient.get(`${selectionUrl}/profile`, {
		params: { userId },
	});
};

export const getSelectionsCount = async (): Promise<{ count: number }> => {
	return await apiClient.get(selectionUrl);
};

export const upsertSelections = async (selectionsToInsert: SelectionToInsert[], matchId: number) => {
	return await apiClient.post(selectionUrl, {selectionsToInsert, matchId});
};

// BIATHLON RESULTS
export const resultMatch = async (biathlonRaceId: string) => {
	return await apiClient.post(`${biathlonResultsUrl}/result`, {biathlonRaceId});
};

// LEAGUE
export const addLeague = async (req: LeagueToInsertRequest): Promise<DbLeague[]> => {
	return await apiClient.post(`${leagueUrl}`, req);
};

export const joinLeague = async (req: JoinLeagueRequest): Promise<DbLeague[]> => {
	return await apiClient.post(`${leagueUrl}/join`, req);
};

export const getLeagues = async (): Promise<DbLeague[]> => {
	return await apiClient.get(`${leagueUrl}`);
};

// PROFILE
export const updateUserInfo = async (req: UserInfoToInsert): Promise<DbProfile[]> => {
	return await apiClient.post(`${profileUrl}`, req);
};

export const getProfiles = async (): Promise<DbProfile[]> => {
	return await apiClient.get(`${profileUrl}`);
};
