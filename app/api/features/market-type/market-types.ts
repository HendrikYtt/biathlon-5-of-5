import {DbCompetitor, DbSelection, OptionsToChooseFromForUser} from '@/types/types';
import {Result} from '@/app/api/features/biathlon-results/types';
import {
	bestCompetitorWithCertainSki, bestCountryPlaceThatWentOnPenaltyLap,
	bestFromCountriesFunc,
	bestFromNOTCountriesFunc,
	competitorBehindWinnerFunc, competitorNameFromCountryFunc,
	competitorPlaceFromCountryFunc,
	competitorPlaceFunc,
	competitorPodiumPlaceFunc, countriesOverFinishLineFunc,
	countryPenaltyFunc,
	countryPenaltySumFunc,
	countryPlaceHigherThanStartOrder,
	countryPodiumPlaceFunc, countryTimeLostTo1stPlace, countryTimeLostTo1stPlaceAfter1stLeg, countryWithMostPenaltyLaps,
	extraBulletsUsedFunc,
	fastestFunc,
	fastestLegFunc, howManyCompetitorsWithCertainSkisOnPodium,
	howManyInTopXFromCountryY,
	lappedFunc,
	leastPenaltiesIndOrExtraLapsTeamFunc,
	openingLegWinnerFunc,
	penaltyCountFunc,
	placeDiffFunc,
	placeFunc,
	top3PenaltySumFunc, usedExtraBulletsForCountry,
	zeroPenaltyCountFunc
} from '@/app/api/features/market-type/functions';
import {AnalysisType} from '@/app/api/features/biathlon-results/requests';
import {DisciplineId} from '@/app/api/features/biathlon-results/service';

export interface MarketType {
	name: string;
	isTeam: boolean;
	optionsForUser: OptionsToChooseFromForUser;
	formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, dbCompetitors?: DbCompetitor[], discipline?: DisciplineId) => { resultKeys: string[], pointsByProfileIdAndMarketId: Record<string, number> };
	needsCompetitors?: boolean;
	needsDiscipline?: boolean;
	needsAnalysis?: boolean;
	analysisType?: AnalysisType
}

const marketTypesWithoutId: MarketType[] = [
	{
		name: 'I koht (Riik)',
		isTeam: true,
		optionsForUser: 'Team',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countryPodiumPlaceFunc(results, selectionsByProfileIdAndMarketId, 1);
		}
	},
	{
		name: 'II koht (Riik)',
		isTeam: true,
		optionsForUser: 'Team',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countryPodiumPlaceFunc(results, selectionsByProfileIdAndMarketId, 2);
		}
	},
	{
		name: 'III koht (Riik)',
		isTeam: true,
		optionsForUser: 'Team',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countryPodiumPlaceFunc(results, selectionsByProfileIdAndMarketId, 3);
		}
	},
	{
		name: 'Mitmendale kohale tuleb Tuuli?',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return competitorPlaceFunc(results, selectionsByProfileIdAndMarketId, false, 'TOMINGAS Tuuli');
		}
	},
	{
		name: 'Mitmendale kohale tuleb Eesti?',
		isTeam: true,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return competitorPlaceFunc(results, selectionsByProfileIdAndMarketId, true, 'ESTONIA');
		}
	},
	{
		name: 'Vähim varupadruneid kasutanud riik',
		isTeam: true,
		optionsForUser: 'Team',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {

			return leastPenaltiesIndOrExtraLapsTeamFunc(results, selectionsByProfileIdAndMarketId, true);
		}
	},
	{
		name: 'Vähim Trahve (Võistleja)',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {

			return leastPenaltiesIndOrExtraLapsTeamFunc(results, selectionsByProfileIdAndMarketId, false);
		}
	},
	{
		name: 'Mahavõetute Arv (Riigid)',
		isTeam: true,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return lappedFunc(results, selectionsByProfileIdAndMarketId, true);
		}
	},
	{
		name: 'Mahavõetute Arv (Võistlejad)',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return lappedFunc(results, selectionsByProfileIdAndMarketId, false);
		}
	},
	{
		name: 'Parim võistleja Baltikumist',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return bestFromCountriesFunc(results, selectionsByProfileIdAndMarketId, ['EST', 'LAT', 'LTU'], 'Name', false);
		}
	},
	{
		name: 'Parim võistleja koht Baltikumist',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return bestFromCountriesFunc(results, selectionsByProfileIdAndMarketId, ['EST', 'LAT', 'LTU'], 'ResultOrder', false);
		}
	},
	{
		name: 'Tuuli Trahvide Arv',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return penaltyCountFunc(results, selectionsByProfileIdAndMarketId, ['TOMINGAS Tuuli']);
		}
	},
	{
		name: 'Nulli Lasknud',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return zeroPenaltyCountFunc(results, selectionsByProfileIdAndMarketId);
		}
	},
	{
		name: 'Avavahetuse Võitja (Riik)',
		isTeam: true,
		optionsForUser: 'Team',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return openingLegWinnerFunc(results, selectionsByProfileIdAndMarketId);
		}
	},
	{
		name: 'Kiireim Vahetus (Võistleja)',
		isTeam: true,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return fastestLegFunc(results, selectionsByProfileIdAndMarketId, 'Any');
		}
	},
	{
		name: 'LAEGREID Sturla Holm Varupadrunid',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return extraBulletsUsedFunc(results, selectionsByProfileIdAndMarketId, 'LAEGREID Sturla Holm');
		}
	},
	{
		name: 'TOP3 Trahvide Summa',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return top3PenaltySumFunc(results, selectionsByProfileIdAndMarketId);
		}
	},
	{
		name: 'Tuuli Koha Muutus',
		isTeam: false,
		optionsForUser: 'Number',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return placeDiffFunc(results, selectionsByProfileIdAndMarketId, 'TOMINGAS Tuuli');
		},
	},
	{
		name: 'Tuuli Lõppkoht',
		isTeam: false,
		optionsForUser :'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return placeFunc(results, selectionsByProfileIdAndMarketId, 'TOMINGAS Tuuli');
		},
	},
	{
		name: 'Susani Koha Muutus',
		isTeam: false,
		optionsForUser: 'Number',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return placeDiffFunc(results, selectionsByProfileIdAndMarketId, 'KUELM Susan');
		},
	},
	{
		name: 'Paremuselt 5. Norrakas',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return competitorNameFromCountryFunc(results, selectionsByProfileIdAndMarketId, 5, 'NOR');
		},
	},
	{
		name: 'Norralaste Trahvid Kokku',
		isTeam: true,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countryPenaltySumFunc(results, selectionsByProfileIdAndMarketId, 'NOR');
		},
	},
	{
		name: 'Tuuli Kaotus Võitjale',
		isTeam: false,
		optionsForUser: 'NumberRange15',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return competitorBehindWinnerFunc(results, selectionsByProfileIdAndMarketId, 'TOMINGAS Tuuli', 'Name');
		},
	},
	{
		name: 'Parim Rossignoli võistleja',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, dbCompetitors: DbCompetitor[]) => {
			return bestCompetitorWithCertainSki(results, selectionsByProfileIdAndMarketId, 'Rossignol', dbCompetitors);
		},
		needsCompetitors: true
	},
	{
		name: 'Parim Salomoni võistleja',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, dbCompetitors: DbCompetitor[]) => {
			return bestCompetitorWithCertainSki(results, selectionsByProfileIdAndMarketId, 'Salomon', dbCompetitors);
		},
		needsCompetitors: true
	},
	{
		name: 'I koht (Võistleja)',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return competitorPodiumPlaceFunc(results, selectionsByProfileIdAndMarketId, 1);
		}
	},
	{
		name: 'II koht (Võistleja)',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return competitorPodiumPlaceFunc(results, selectionsByProfileIdAndMarketId, 2);
		}
	},
	{
		name: 'III koht (Võistleja)',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return competitorPodiumPlaceFunc(results, selectionsByProfileIdAndMarketId, 3);
		}
	},
	{
		name: 'Parim Madshuse võistleja',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, dbCompetitors: DbCompetitor[]) => {
			return bestCompetitorWithCertainSki(results, selectionsByProfileIdAndMarketId, 'Madshus', dbCompetitors);
		},
		needsCompetitors: true
	},
	{
		name: 'Mitu Eesti sportlast lõpetab TOP40?',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return howManyInTopXFromCountryY(results, selectionsByProfileIdAndMarketId, 40, 'EST');
		},
	},
	{
		name: 'Parim Saksamaa võistleja',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return bestFromCountriesFunc(results, selectionsByProfileIdAndMarketId, ['GER'], 'Name', false);
		}
	},
	{
		name: 'Kes on parim mitte norralane?',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return bestFromNOTCountriesFunc(results, selectionsByProfileIdAndMarketId, ['NOR'], 'Name');
		}
	},
	{
		name: 'Kas Eesti koht finisis on kõrgem kui stardinumber?',
		isTeam: true,
		optionsForUser: 'ThreeWay',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countryPlaceHigherThanStartOrder(results, selectionsByProfileIdAndMarketId, 'EST');
		}
	},
	{
		name: 'Mitu trahviringi sõidab Eesti?',
		isTeam: true,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countryPenaltyFunc(results, selectionsByProfileIdAndMarketId, 'EST');
		}
	},
	{
		name: 'Mitu riiki jõuab üle finišijoone?',
		isTeam: true,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countriesOverFinishLineFunc(results, selectionsByProfileIdAndMarketId);
		}
	},
	{
		name: 'Milline riik sõidab enim trahviringe?',
		isTeam: true,
		optionsForUser: 'Team',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countryWithMostPenaltyLaps(results, selectionsByProfileIdAndMarketId);
		}
	},
	{
		name: 'Parim Baltikumi riik?',
		isTeam: true,
		optionsForUser: 'Team',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return bestFromCountriesFunc(results, selectionsByProfileIdAndMarketId, ['EST', 'LAT', 'LTU'], 'Name', true);
		}
	},
	{
		name: 'Kõige kiirem teise vahetuse läbija',
		isTeam: true,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return fastestLegFunc(results, selectionsByProfileIdAndMarketId, 'Second');
		}
	},
	{
		name: 'Kõige kiirem kolmanda vahetuse läbija',
		isTeam: true,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return fastestLegFunc(results, selectionsByProfileIdAndMarketId, 'Third');
		}
	},
	{
		name: 'Parim trahviringil käinud võistkonna koht?',
		isTeam: true,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return bestCountryPlaceThatWentOnPenaltyLap(results, selectionsByProfileIdAndMarketId);
		}
	},
	{
		name: 'Kes on parim prantslane?',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return bestFromCountriesFunc(results, selectionsByProfileIdAndMarketId, ['FRA'], 'Name', false);
		}
	},
	{
		name: 'Kes on parim rootslane?',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return bestFromCountriesFunc(results, selectionsByProfileIdAndMarketId, ['SWE'], 'Name', false);
		}
	},
	{
		name: 'Parim eestlase koht finisis',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return bestFromCountriesFunc(results, selectionsByProfileIdAndMarketId, ['EST'], 'ResultOrder', false);
		}
	},
	{
		name: 'Mitu varupadrunit kasutab Saksamaa?',
		isTeam: true,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return usedExtraBulletsForCountry(results, selectionsByProfileIdAndMarketId, 'GER');
		}
	},
	{
		name: 'Mitu Madshuse sportlast on poodiumil?',
		isTeam: true,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, dbCompetitors: DbCompetitor[]) => {
			return howManyCompetitorsWithCertainSkisOnPodium(results, selectionsByProfileIdAndMarketId, 'Madshus', dbCompetitors);
		},
		needsCompetitors: true
	},
	{
		name: 'Mitu Salomoni sportlast on poodiumil?',
		isTeam: true,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, dbCompetitors: DbCompetitor[]) => {
			return howManyCompetitorsWithCertainSkisOnPodium(results, selectionsByProfileIdAndMarketId, 'Salomon', dbCompetitors);
		},
		needsCompetitors: true
	},
	{
		name: 'Eesti kaotus liidrile pärast avavahetust?',
		isTeam: true,
		optionsForUser: 'NumberRange15',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countryTimeLostTo1stPlaceAfter1stLeg(results, selectionsByProfileIdAndMarketId, 'EST');
		}
	},
	{
		name: 'Kui palju kaotab teine koht finišis esimesele?',
		isTeam: true,
		optionsForUser: 'NumberRange15',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return countryTimeLostTo1stPlace(results, selectionsByProfileIdAndMarketId, 2);
		}
	},
	{
		name: 'Mitu sek kaotab parim eestlane võitjale?',
		isTeam: false,
		optionsForUser: 'NumberRange15',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return competitorBehindWinnerFunc(results, selectionsByProfileIdAndMarketId, 'EST', 'Nat');
		}
	},
	{
		name: 'Mis kohal lõpetab paremuselt neljas norralane?',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, dbCompetitors: DbCompetitor[], discipline: DisciplineId) => {
			return competitorPlaceFromCountryFunc(results, selectionsByProfileIdAndMarketId, 4, 'NOR', discipline);
		},
		needsDiscipline: true
	},
	{
		name: 'Mitu trahviringi sõidavad OEBERG Elvira ja OEBERG Hanna kokku?',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return penaltyCountFunc(results, selectionsByProfileIdAndMarketId, ['OEBERG Elvira', 'OEBERG Hanna']);
		}
	},
	{
		name: 'Mitu trahviringi sõidavad BOE Johannes Thingnes ja BOE Tarjei kokku?',
		isTeam: false,
		optionsForUser: 'PositiveNumber',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return penaltyCountFunc(results, selectionsByProfileIdAndMarketId, ['BOE Johannes Thingnes', 'BOE Tarjei']);
		}
	},
	{
		name: 'Kes on kõige kiirem rajal (ainult sõiduaeg ilma tiiruta)?',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return fastestFunc(results, selectionsByProfileIdAndMarketId);
		},
		needsAnalysis: true,
		analysisType: 'Total Course Time'
	},
	{
		name: 'Kes on kõige kiirem tiirus (Total Shooting Time)?',
		isTeam: false,
		optionsForUser: 'Competitor',
		formula: (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
			return fastestFunc(results, selectionsByProfileIdAndMarketId);
		},
		needsAnalysis: true,
		analysisType: 'Total Shooting Time'
	},
];

export const marketTypes: (MarketType & { id: number })[] = marketTypesWithoutId.map((mt, index) => {
	return {
		...mt,
		id: index + 1
	};
});
