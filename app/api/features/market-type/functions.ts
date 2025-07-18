import {CompetitorResponse, Result} from '@/app/api/features/biathlon-results/types';
import {DbCompetitor, DbSelection} from '@/types/types';
import {numberRanges15} from '@/app/api/features/market-type/const';
import {keyBy, uniqBy} from 'lodash';

export const countryPodiumPlaceFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, place: number) => {
	const top3 = Array.isArray(results)
		? results.filter(r => r?.IsTeam === true).slice(0, 3)
		: [];

	const country = place >= 1 && place <= 3 ? top3[place - 1] : undefined;

	const pointsByProfileIdAndMarketId: Record<string, number> = {};

	Object.entries(selectionsByProfileIdAndMarketId || {}).forEach(([key, selection]) => {
		let points = 0;
		if (country?.Name && selection?.result_key === country.Name) {
			points = 3;
		} else if (top3.some(team => team?.Name === selection?.result_key)) {
			points = 1;
		}
		pointsByProfileIdAndMarketId[key] = points;
	});

	return {
		resultKeys: country?.Name ? [country.Name] : ['N/A'],
		pointsByProfileIdAndMarketId
	};
};

export const competitorPodiumPlaceFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, place: number) => {
	const top3 = Array.isArray(results) ? results.slice(0, 3) : [];
	const competitor = place >= 1 && place <= 3 ? top3[place - 1] : undefined;
	const pointsByProfileIdAndMarketId: Record<string, number> = {};

	Object.entries(selectionsByProfileIdAndMarketId || {}).forEach(([key, selection]) => {
		let points = 0;
		if (competitor?.Name && selection?.result_key === competitor.Name) {
			points = 3;
		} else if (top3.some(team => team?.Name === selection?.result_key)) {
			points = 1;
		}
		pointsByProfileIdAndMarketId[key] = points;
	});

	return {
		resultKeys: competitor?.Name ? [competitor.Name] : ['N/A'],
		pointsByProfileIdAndMarketId
	};
};

export const competitorPlaceFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, isTeam: boolean, competitorName: string) => {
	const competitor = results.find(r => r.Name === competitorName);
	const actualPlace = competitor ? parseInt(competitor.Rank) : null;
	const pointsByProfileIdAndMarketId: Record<string, number> = {};

	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		let points = 0;
		const predictedPlace = parseInt(selection.result_key);

		if (actualPlace !== null && !isNaN(predictedPlace)) {
			const difference = Math.abs(actualPlace - predictedPlace);

			if (difference <= 1) {
				points = 3;
			} else if (difference === 2 || difference === 3) {
				points = isTeam ? 0 : 3;
			} else {
				points = 0;
			}
		}

		pointsByProfileIdAndMarketId[key] = points;
	});

	return {
		resultKeys: actualPlace !== null ? [actualPlace.toString()] : ['N/A'],
		pointsByProfileIdAndMarketId
	};
};

// varupadrunid
export const leastPenaltiesIndOrExtraLapsTeamFunc = (
	results: Result[],
	selectionsByProfileIdAndMarketId: Record<string, DbSelection>,
	isTeam: boolean
) => {

	const shootingsByName: Record<string, number> = {};
	results.forEach((r) => {

		const condition = isTeam ? r.ShootingTotal && r.Name && r.Leg === 0 : r.ShootingTotal && r.Name;
		if (condition) {
			if (!shootingsByName[r.Name]) {
				shootingsByName[r.Name] = 0;
			}
			const total = isTeam ? parseInt(r.ShootingTotal.split('+')[1] || '0') : parseInt(r.ShootingTotal);
			shootingsByName[r.Name] += total;
		}
	});

	const sortedShootings = Object.entries(shootingsByName).sort((a, b) => a[1] - b[1]);

	const minPenalties = sortedShootings[0][1];
	const correctResults = sortedShootings
		.filter(([_, penalties]) => penalties === minPenalties)
		.map(([countryName]) => countryName);


	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (correctResults.includes(selection.result_key)) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});

	return {
		resultKeys: correctResults,
		pointsByProfileIdAndMarketId,
	};
};

export const lappedFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, isTeam: boolean) => {
	const lappedCount = results.filter(r => {
		const condition = isTeam ? r.Leg === 0 && r.Result === 'Lapped' : r.Result === 'LAP';
		return condition;
	}).length.toString();
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === lappedCount) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}

	});
	return {
		resultKeys: [lappedCount],
		pointsByProfileIdAndMarketId
	};
};

export const bestFromCountriesFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, countries: string[], field: 'Name' | 'ResultOrder', isTeam: boolean) => {
	const includedNationalities = results.filter(r => countries.includes(r.Nat) && isTeam === r.IsTeam);
	const sorted = includedNationalities.sort((a, b) => {
		const aTime = (a.TotalTime === 'Lapped' || a.TotalTime === null) ? Infinity : convertTimeToSeconds(a.TotalTime);
		const bTime = (b.TotalTime === 'Lapped' || b.TotalTime === null) ? Infinity : convertTimeToSeconds(b.TotalTime);
		return aTime - bTime;
	});
	const bestFromCountries = sorted[0];

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		let condition;
		if (field === 'ResultOrder') {
			condition = Math.abs(parseInt(selection.result_key) - bestFromCountries[field]) < 4;
		} else {
			condition = selection.result_key === bestFromCountries[field].toString();
		}

		if (condition) {
			if (!isTeam && field === 'ResultOrder') {
				pointsByProfileIdAndMarketId[key] = 3;
			} else {
				pointsByProfileIdAndMarketId[key] = 1;
			}
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: bestFromCountries ? [bestFromCountries[field].toString()] : [],
		pointsByProfileIdAndMarketId
	};
};


export const bestFromNOTCountriesFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, notCountries: string[], field: 'Name' | 'ResultOrder') => {
	const includedNationalities = results.filter(r => !notCountries.includes(r.Nat));

	const bestFromCountries = includedNationalities.sort((a, b) => {
		return a.ResultOrder - b.ResultOrder;
	})[0];

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === bestFromCountries[field].toString()) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: bestFromCountries ? [bestFromCountries[field].toString()] : [],
		pointsByProfileIdAndMarketId
	};
};

export const penaltyCountFunc = (
	results: Result[],
	selectionsByProfileIdAndMarketId: Record<string, DbSelection>,
	competitorNames: string[]
) => {

	const competitors = results.filter(r => competitorNames.includes(r.Name));
	const penaltyCount = competitors.map(c => c.ShootingTotal ? +c.ShootingTotal : 0).reduce((acc, curr) => acc + curr, 0).toString();
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === penaltyCount) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: penaltyCount ? [penaltyCount] : [],
		pointsByProfileIdAndMarketId
	};
};

export const zeroPenaltyCountFunc = (
	results: Result[],
	selectionsByProfileIdAndMarketId: Record<string, DbSelection>
) => {
	const zeroPenaltyCount = results.filter(r => r.ShootingTotal === '0').length.toString();
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === zeroPenaltyCount) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [zeroPenaltyCount],
		pointsByProfileIdAndMarketId
	};
};

export const openingLegWinnerFunc = (
	results: Result[],
	selectionsByProfileIdAndMarketId: Record<string, DbSelection>
) => {
	const firstLegWinnerCompetitor = results.find(r => r.Leg === 1 && r.Behind === '0.0');
	const firstLegWinnerCountry = results.find(r => r.Leg === 0 && r.Nat === firstLegWinnerCompetitor.Nat).Name;
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === firstLegWinnerCountry) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [firstLegWinnerCountry],
		pointsByProfileIdAndMarketId
	};
};

export const fastestLegFunc = (
	results: Result[],
	selectionsByProfileIdAndMarketId: Record<string, DbSelection>,
	leg: 'Any' | 'First' | 'Second' | 'Third' | 'Fourth'
) => {
	const yes = processCompetitorLegTimes(results);

	const filteredLegTimes =
		leg === 'Any'
			? yes
			: yes.filter(entry => entry.Leg === (leg === 'First' ? 1 : leg === 'Second' ? 2 : leg === 'Third' ? 3 : 4));

	const fastestLeg =
		filteredLegTimes.sort((a, b) => convertTimeToSecondsColons(a.LegTime) - convertTimeToSecondsColons(b.LegTime))[0]?.Name;

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === fastestLeg) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: fastestLeg ? [fastestLeg] : [],
		pointsByProfileIdAndMarketId
	};
};

export const extraBulletsUsedFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, competitorName: string) => {
	const competitor = results.find(r => r.Name === competitorName);
	const extraBullets = competitor ? competitor.ShootingTotal.split('+')[1] : 'N/A';
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === extraBullets) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [extraBullets],
		pointsByProfileIdAndMarketId
	};
};

export const top3PenaltySumFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
	const top3 = results.sort((a, b) => parseInt(a.Rank) - parseInt(b.Rank)).slice(0, 3);
	const sum = top3.reduce((sum, r) => sum + (parseInt(r.ShootingTotal || '0')), 0).toString();
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === sum) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [sum],
		pointsByProfileIdAndMarketId
	};
};

export const countryPenaltyFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, country: string) => {
	const countryCompetitors = results.filter(r => r.Nat === country && !r.IsTeam);
	const penalty = countryCompetitors.reduce((sum, r) => sum + (parseInt(r.ShootingTotal || '0')), 0).toString();
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === penalty) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [penalty],
		pointsByProfileIdAndMarketId
	};
};

export const countriesOverFinishLineFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
	const countriesOverFinishLine = results.filter(r => r.Leg === 0 && r.TotalTime !== 'Lapped' && r.TotalTime !== null).length.toString();

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === countriesOverFinishLine) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [countriesOverFinishLine],
		pointsByProfileIdAndMarketId
	};
};

// trahviringid
export const countryWithMostPenaltyLaps = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>) => {
	const countryMisses = results
		.filter(entry => !entry.IsTeam && entry.ShootingTotal)
		.reduce((acc, athlete) => {
			const misses = Number(athlete.ShootingTotal.split('+')[0]);
			acc[athlete.Nat] = (acc[athlete.Nat] || 0) + misses;
			return acc;
		}, {} as Record<string, number>);

	const maxMisses = Math.max(...Object.values(countryMisses));
	const highestCountries = Object.entries(countryMisses)
		.filter(([_, misses]) => misses === maxMisses)
		.map(([country]) => country);

	const countries = results.filter(r => highestCountries.includes(r.Nat) && r.IsTeam).map(r => r.Name);

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (countries.includes(selection.result_key)) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: countries,
		pointsByProfileIdAndMarketId
	};
};

export const placeDiffFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, competitorName: string) => {
	const competitor = results.find(r => r.Name === competitorName);
	const diff = competitor ? (competitor.ResultOrder - competitor.StartOrder).toString() : 'N/A';
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === diff) {
			pointsByProfileIdAndMarketId[key] = 3;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [diff],
		pointsByProfileIdAndMarketId
	};
};

export const placeFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, competitorName: string) => {
	const competitor = results.find(r => r.Name === competitorName);
	const diff = competitor ? competitor.Rank : 'N/A';
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === diff) {
			pointsByProfileIdAndMarketId[key] = 3;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [diff],
		pointsByProfileIdAndMarketId
	};
};

export const competitorPlaceFromCountryFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, placeFromCountry: number, nationality: string, discipline: string) => {
	const fromCertainCountry = results.filter(r => r.Nat === nationality);
	const nthPlace = fromCertainCountry.sort((a, b) => parseInt(a.Rank) - parseInt(b.Rank))[placeFromCountry - 1];
	const competitorPlace = nthPlace ? nthPlace.ResultOrder : -9999;

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		const diff = (['SR', 'RL', 'MS']).includes(discipline) ? 1 : 3;
		if (Math.abs(parseInt(selection.result_key) - competitorPlace) <= diff) {
			pointsByProfileIdAndMarketId[key] = 3;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [competitorPlace === -9999 ? 'N/A' : competitorPlace.toString()],
		pointsByProfileIdAndMarketId
	};
};

export const competitorNameFromCountryFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, placeFromCountry: number, nationality: string) => {
	const fromCertainCountry = results.filter(r => r.Nat === nationality);
	const nthPlace = fromCertainCountry.sort((a, b) => parseInt(a.Rank) - parseInt(b.Rank))[placeFromCountry - 1];
	const competitorPlace = nthPlace ? nthPlace.Name : 'N/A';

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === competitorPlace) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [competitorPlace],
		pointsByProfileIdAndMarketId
	};
};

export const countryPenaltySumFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, nationality: string) => {
	const fromCertainCountry = results.filter(r => r.Nat === nationality);
	const sum = fromCertainCountry.reduce((sum, r) => sum + (parseInt(r.ShootingTotal || '0')), 0).toString();
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === sum) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [sum],
		pointsByProfileIdAndMarketId
	};
};

export const competitorBehindWinnerFunc = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, competitorOrCountryName: string, field: 'Nat' | 'Name') => {
	const competitor = results.find(r => r[field] === competitorOrCountryName);
	const behindTime = competitor.Behind;
	const secondsBehind = convertTimeToSeconds(behindTime);
	console.log('secondsBehind', secondsBehind);

	const numberRange = numberRanges15.find(nr => {
		const [start, end] = nr.label.split(' to ');
		const startMs = convertTimeToSeconds(start.replace('+', ''));
		const endMs = convertTimeToSeconds(end.replace('+', ''));

		const isStartBeforeTime = startMs <= secondsBehind;
		const isEndAfterTime = endMs > secondsBehind;
		return isStartBeforeTime && isEndAfterTime;
	});
	console.log('numberRanges15', numberRanges15);
	console.log('numberRange', numberRange);

	const numberRangeLabel = numberRange ? numberRange.label : 'N/A';

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === numberRangeLabel) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [behindTime],
		pointsByProfileIdAndMarketId
	};
};

export const bestCompetitorWithCertainSki = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, skiName: string, dbCompetitors: DbCompetitor[]) => {
	const dbCompetitorsByIBUId = keyBy(dbCompetitors || [], x => x.ibu_id);

	const bestCompetitor = Array.isArray(results) ? results.find(r => {
		const competitor = dbCompetitorsByIBUId[r?.IBUId];
		const extraData = competitor?.extra_data as CompetitorResponse;
		const equipment = extraData?.Equipment?.find(e => e?.Id === 'EISK');
		return skiName === equipment?.Value;
	}) : undefined;

	const bestCompetitorName = bestCompetitor?.Name || 'N/A';

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId || {}).forEach(([key, selection]) => {
		pointsByProfileIdAndMarketId[key] = selection?.result_key === bestCompetitorName ? 1 : 0;
	});

	return {
		resultKeys: [bestCompetitorName],
		pointsByProfileIdAndMarketId
	};
};

export const howManyInTopXFromCountryY = (
	results: Result[],
	selectionsByProfileIdAndMarketId: Record<string, DbSelection>,
	topAmount: number,
	country: string
) => {
	const topResults = results.slice(0, topAmount);
	const numberOfCompetitorsFromCountry = topResults.filter(r => r.Nat === country).length.toString();

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === numberOfCompetitorsFromCountry) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});

	return {
		resultKeys: [numberOfCompetitorsFromCountry],
		pointsByProfileIdAndMarketId
	};
};

export const countryPlaceHigherThanStartOrder = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, country: string) => {
	const foundCountry = results.find(r => r.Nat === country);
	const countryNotFoundNumber = -99999;
	const placeDiff = foundCountry ? foundCountry.ResultOrder - parseInt(foundCountry.Bib) : countryNotFoundNumber;
	let outcome: 'JAH' | 'EI' | 'Võrdne' | 'N/A' = 'N/A';
	if (placeDiff === countryNotFoundNumber) {
		outcome = 'N/A';
	} else if (placeDiff === 0) {
		outcome = 'Võrdne';
	} else if (placeDiff > 0) {
		outcome = 'EI';
	} else if (placeDiff < 0) {
		outcome = 'JAH';
	}

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === outcome) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [outcome],
		pointsByProfileIdAndMarketId
	};
};

export const bestCountryPlaceThatWentOnPenaltyLap = (
	results: Result[],
	selectionsByProfileIdAndMarketId: Record<string, DbSelection>
) => {
	const fastestCountryWithPenaltyLap = results
		.filter(r => {
			const didPenaltyLap = r.IsTeam && r.ShootingTotal && r.ShootingTotal.split('+')[0] !== '0';
			return didPenaltyLap;
		})
		.reduce((min, r) => (r.ResultOrder < min.ResultOrder ? r : min));
	const outcome = fastestCountryWithPenaltyLap.ResultOrder;
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		const selectionOutcome = parseInt(selection.result_key, 10);
		pointsByProfileIdAndMarketId[key] = Math.abs(selectionOutcome - outcome) <= 1 ? 3 : 0;
	});
	return {
		resultKeys: [outcome.toString()],
		pointsByProfileIdAndMarketId
	};
};

export const usedExtraBulletsForCountry = (
	results: Result[],
	selectionsByProfileIdAndMarketId: Record<string, DbSelection>,
	country: string
) => {
	const c = results.find(r => r.Nat === country && r.IsTeam);
	const extraBullets = c ? c.ShootingTotal.split('+')[1] : 'N/A';
	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === extraBullets) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [extraBullets],
		pointsByProfileIdAndMarketId
	};
};

export const howManyCompetitorsWithCertainSkisOnPodium = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, skiName: string, dbCompetitors: DbCompetitor[]) => {
	const dbCompetitorsByIBUId = keyBy(dbCompetitors || [], x => x.ibu_id);

	const competitorsWithCertainSkiName = Array.isArray(results)
		? results
			.filter(r => r?.IsTeam === false && (r?.ResultOrder || 0) <= 3)
			.filter(r => {
				const competitor = dbCompetitorsByIBUId[r?.IBUId];
				const extraData = competitor?.extra_data as CompetitorResponse;
				const equipment = extraData?.Equipment?.find(e => e?.Id === 'EISK');
				return equipment ? skiName === equipment.Value : false;
			})
		: [];

	const uniqueCompetitorsWithCertainSkiName = uniqBy(competitorsWithCertainSkiName, x => x?.IBUId);
	const outcome = uniqueCompetitorsWithCertainSkiName.length.toString();

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId || {}).forEach(([key, selection]) => {
		pointsByProfileIdAndMarketId[key] = selection?.result_key === outcome ? 1 : 0;
	});

	return {
		resultKeys: [outcome],
		pointsByProfileIdAndMarketId
	};
};

export const countryTimeLostTo1stPlaceAfter1stLeg = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, country: string) => {
	const yes = processCompetitorLegTimes(results);
	const filteredLegTimes = yes.filter(entry => entry.Leg === 1);
	const countryInQuestion = results.find(r => r.Nat === country && r.Leg === 1);

	const fastestLeg =
		filteredLegTimes.sort((a, b) => convertTimeToSecondsColons(a.LegTime) - convertTimeToSecondsColons(b.LegTime))[0];

	const behind = parseFloat((convertTimeToSecondsColons(countryInQuestion.TotalTime) - convertTimeToSecondsColons(fastestLeg.LegTime)).toFixed(2));
	const rounded = Math.round(behind);
	const numberRange = numberRanges15.find(nr => {
		const [start, end] = nr.label.split(' to ');
		const isStartBeforeTime = convertTimeToSeconds(start.replace('+', '')) <= rounded;
		const isEndAfterTime = convertTimeToSeconds(end.replace('+', '')) >= rounded;
		return isStartBeforeTime && isEndAfterTime;
	});

	const numberRangeLabel = numberRange ? numberRange.label : 'N/A';

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === numberRangeLabel) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [behind.toString()],
		pointsByProfileIdAndMarketId
	};
};

export const countryTimeLostTo1stPlace = (results: Result[], selectionsByProfileIdAndMarketId: Record<string, DbSelection>, resultOrder: number) => {
	const countryInQuestion = results.find(r => r.ResultOrder === resultOrder && r.Leg === 0);

	const behind = parseFloat(countryInQuestion.Behind);
	const rounded = Math.round(behind);

	const numberRange = numberRanges15.find(nr => {
		const [start, end] = nr.label.split(' to ');
		const isStartBeforeTime = convertTimeToSeconds(start.replace('+', '')) <= rounded;
		const isEndAfterTime = convertTimeToSeconds(end.replace('+', '')) >= rounded;
		return isStartBeforeTime && isEndAfterTime;
	});

	const numberRangeLabel = numberRange ? numberRange.label : 'N/A';

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === numberRangeLabel) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [behind.toString()],
		pointsByProfileIdAndMarketId
	};
};

export const fastestFunc = (
	results: Result[],
	selectionsByProfileIdAndMarketId: Record<string, DbSelection>
) => {
	const fastest = results.find(r => r.ResultOrder === 1);

	const fastestName = fastest ? fastest.Name : 'N/A';

	const pointsByProfileIdAndMarketId: Record<string, number> = {};
	Object.entries(selectionsByProfileIdAndMarketId).forEach(([key, selection]) => {
		if (selection.result_key === fastestName) {
			pointsByProfileIdAndMarketId[key] = 1;
		} else {
			pointsByProfileIdAndMarketId[key] = 0;
		}
	});
	return {
		resultKeys: [fastestName],
		pointsByProfileIdAndMarketId
	};
};

const convertTimeToSeconds = (timeString: string) => {
	try {
		const [timeWithoutMs, _] = timeString.split('.');
		const timeParts = timeWithoutMs.split(':').map(Number);

		if (timeParts.length === 3) {
			const [hours, minutes, seconds] = timeParts;
			return hours * 3600 + minutes * 60 + seconds;
		} else if (timeParts.length === 2) {
			const [minutes, seconds] = timeParts;
			return minutes * 60 + seconds;
		} else if (timeParts.length === 1) {
			return timeParts[0];
		} else {
			console.error(`Invalid time format: ${timeString}`);
			return 0;
		}
	} catch (e) {
		console.error(`Error parsing time: ${timeString}`, e);
		return 0;
	}
};

const calculateTimeDifference = (time1: string, time2: string): string => {
	const [min1, sec1] = time1.split(':').map(Number);
	const [min2, sec2] = time2.split(':').map(Number);

	const totalSec1 = min1 * 60 + sec1;
	const totalSec2 = min2 * 60 + sec2;

	const diffSec = totalSec2 - totalSec1;
	const diffMin = Math.floor(diffSec / 60);
	const remainingSec = (diffSec % 60).toFixed(1);

	return `${diffMin}:${remainingSec.padStart(4, '0')}`;
};

const processCompetitorLegTimes = (data: Result[]) => {
	const competitors = data
		.filter((entry): entry is Result & { Leg: number } => entry.Leg !== null && entry.Leg !== 0)
		.sort((a, b) => a.Leg - b.Leg);

	const teamGroups: { [key: string]: (Result & { Leg: number })[] } = {};
	competitors.forEach(competitor => {
		if (!teamGroups[competitor.Nat]) {
			teamGroups[competitor.Nat] = [];
		}
		teamGroups[competitor.Nat].push(competitor);
	});

	return Object.values(teamGroups).flatMap(team => {
		return team.filter(t => t.TotalTime !== null).map((competitor, index) => {
			try {
				const legTime = index === 0
					? competitor.TotalTime
					: calculateTimeDifference(team[index - 1].TotalTime, competitor.TotalTime);

				return {
					Name: competitor.Name,
					Nat: competitor.Nat,
					Leg: competitor.Leg,
					LegTime: legTime
				};
			} catch (e) {
				console.log(e);
				console.log(team);
				console.log(competitor);
				console.log(team[index - 1].TotalTime, competitor.TotalTime);
			}
		});
	});
};

const convertTimeToSecondsColons = (time: string): number => {
	const [min, sec] = time.split(':').map(Number);
	return min * 60 + sec;
};