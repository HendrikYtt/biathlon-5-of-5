export const podiumPlacesCountryMtIds = [1, 2, 3];
export const podiumPlacesCompetitorMtIds = [26, 27, 28];

export const prioritizedIds = [...podiumPlacesCountryMtIds, ...podiumPlacesCompetitorMtIds];

export const specialMtGroups: Record<string, number[]> = {
	'country-1-3': podiumPlacesCountryMtIds,
	'competitor-26-28': podiumPlacesCompetitorMtIds,
};

export const threeWayOptions = [
	{
		label: 'EI',
		value: 'EI',
	},
	{
		label: 'JAH',
		value: 'JAH',
	},
	{
		label: 'Võrdne',
		value: 'Võrdne',
	},
];

export const numberRanges15 = Array.from({ length: 30 }, (_, i) => {
	const totalSeconds = i * 15;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);
	const nextTotalSeconds = totalSeconds + 14;
	const nextMinutes = Math.floor(nextTotalSeconds / 60);
	const nextSeconds = Math.floor(nextTotalSeconds % 60);

	const start = `+${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	const end = `+${nextMinutes.toString().padStart(2, '0')}:${nextSeconds.toString().padStart(2, '0')}`;

	return {
		label: `${start} to ${end}`,
		value: `${start} to ${end}`,
	};
});