import React, { useEffect, useState } from 'react';
import { getSelections } from '@/libs/api/features';
import { SelectionWithExtra } from '@/app/api/features/selection/database';
import _ from 'lodash';
import {
	prioritizedIds
} from '@/app/api/features/market-type/const';
import CompetitionTabs from '@/app/dashboard/CompetitionTabs';
import {countries} from '@/app/user-info/const';
import {useAuthStore} from '@/libs/stores/authStore';
import {useFeatureStore} from '@/libs/stores/categoryStore';

type GroupedData = {
	[email: string]: {
		selections: SelectionWithExtra[];
		totalPoints: number;
	}
};

interface LeaderboardProps {
	leagueId: number;
}

export const Leaderboard = ({leagueId}: LeaderboardProps) => {
	const { user } = useAuthStore();
	const {categories} = useFeatureStore();
	const [leaderboardData, setLeaderboardData] = useState<GroupedData>({});
	const [expandedRow, setExpandedRow] = useState<number | null>(null);
	const [groupedData, setGroupedData] = useState<any>(null);

	const [currentlyActiveCategoryId, setCurrentlyActiveCategoryId] = useState(categories.find(c => c.is_active).id);
	const [activeTab, setActiveTab] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchResults = async () => {
			try {
				setIsLoading(true);
				const resp = await getSelections(leagueId);
				const groupedAndSummed = _.chain(resp)
					.groupBy('email')
					.mapValues((selections) => ({
						selections,
						totalPoints: _.sumBy(selections, selection => selection.points || 0)
					}))
					.toPairs()
					.orderBy([pair => pair[1].totalPoints], ['desc'])
					.fromPairs()
					.value();

				setLeaderboardData(groupedAndSummed);
			} finally {
				setIsLoading(false);
			}

		};
		fetchResults();
	}, []);

	const handleRowClick = (index: number) => {
		if (expandedRow === index) {
			setExpandedRow(null);
			setGroupedData(null);
		} else {
			setExpandedRow(index);
			const userSelections = Object.values(leaderboardData)[index].selections;
			const newGroupedData = _.chain(userSelections)
				.groupBy(item => `${item.category_name} | ${item.location}__${item.category_start_time}__${item.category_id}`)
				.mapValues(categoryGroup =>
					_.chain(categoryGroup)
						.groupBy(item => `${item.match_name}__${item.match_start_time}`)
						.mapValues(matchGroup =>
							_.groupBy(matchGroup, 'market_name')
						)
						.toPairs()
						.sortBy(([matchKey]) => new Date(matchKey.split('__')[1]))
						.fromPairs()
						.value()
				)
				.toPairs()
				.sortBy(([categoryKey]) => new Date(categoryKey.split('__')[1]))
				.fromPairs()
				.value();

			setGroupedData(newGroupedData);
		}
	};

	const leaderBoard = Object.values(leaderboardData);

	return (
		<div className="mt-4 mb-8">
			<div className="overflow-x-auto rounded-xl lg:p-4 h-full border border-base-content/20 min-w-0">
				{isLoading ? (
					<div
						className="flex flex-row justify-center py-4"
					>
						<span className="loading loading-spinner loading-xl"></span>
					</div>
				) : (
					<table className="table max-lg:table-sm w-full">
						<thead className="text-sm">
							<tr className="!border-base-content/20">
								<th>Rank</th>
								<th>Points</th>
								<th>Username</th>
							</tr>
						</thead>
						<tbody>
							{leaderBoard.length === 0 && (
								<tr className="p-4">
									<td colSpan={3}>No data</td>
								</tr>
							)}
							{leaderBoard.map((selection, index) => {
								const countryCode = countries.find(c => c.label === selection.selections[0].user_country)!.code;
								return (
									<React.Fragment key={index}>
										<tr
											className="cursor-pointer border-base-content/20"
											onClick={() => handleRowClick(index)}
										>
											<td className="text-3xl text-accent text-left">
												<div className="flex items-center">
													<span className="text-lg text-primary ml-2.5">
														{index + 1}
													</span>
												</div>
											</td>
											<td>
												<span className="font-semibold whitespace-nowrap">
													{selection.totalPoints}
												</span>
											</td>
											<td>
												<div className="flex items-center gap-2">
													<div className="flex flex-row">
														<p
															className="mr-1 font-bold whitespace-nowrap truncate"
														>
															{selection.selections[0].username}
														</p>
														<span className={`fi fi-${countryCode}`}></span>
													</div>
												</div>
											</td>
										</tr>
										{(() => {
											if (expandedRow === index && groupedData) {
												const predictions = Object.entries(groupedData).filter(([categoryNameAndStartTime, matches]) => {
													return +categoryNameAndStartTime.split('__')[2] === currentlyActiveCategoryId;
												});
												return (
													<tr>
														<td colSpan={3} className="p-6">
															<div className="max-w-xs md:max-w-2xl lg:max-w-4xl mx-auto">
																<CompetitionTabs
																	activeTab={activeTab}
																	setActiveTab={setActiveTab}
																	currentlyActiveCategoryId={currentlyActiveCategoryId}
																	setCurrentlyActiveCategoryId={setCurrentlyActiveCategoryId}
																	showCheckboxes={false}
																/>
															</div>
															{predictions.length === 0 && (
																<div className="flex flex-row justify-center mt-4 mb-4 mx-auto">
																	<h5 className="xs:text-md md:text-lg">
																		No predictions made for this competition
																	</h5>
																</div>
															)}
															{predictions.length > 0 && predictions.map(([categoryNameAndStartTime, matches]) => {
																return (
																	<div key={categoryNameAndStartTime}
																		 className="mt-6">
																		<h4 className="text-lg font-semibold mb-2">
																			{categoryNameAndStartTime.split('__')[0]}
																			<span
																				className="text-white font-light ml-2">
																				{new Date(categoryNameAndStartTime.split('__')[1]).toLocaleDateString('en-GB', {
																					year: 'numeric',
																					month: 'short',
																					day: 'numeric'
																				})}
																			</span>
																		</h4>
																		{Object.entries(matches)
																			.filter(([matchNameAndStartTime, markets]) => {
																				const date = new Date(matchNameAndStartTime.split('__')[1]);
																				const [m] = Object.entries(markets);
																				// @ts-ignore
																				const selectionEmail = m[1][0].email;
																				//Reveal predictions only if they belong to the user and match date is in past
																				return !(user.email !== selectionEmail && new Date() < date);
																				// return true;
																			})
																			.map(([matchNameAndStartTime, markets]) => {
																				return (
																					<div key={matchNameAndStartTime}
																					 className="mt-4 mb-4">
																						<h5 className="text-md font-medium mb-2">
																							{matchNameAndStartTime.split('__')[0]}
																							<span
																								className="text-white font-light ml-2">
																								{new Date(matchNameAndStartTime.split('__')[1]).toLocaleDateString('en-GB', {
																									hour: '2-digit',
																									minute: '2-digit',
																									day: '2-digit',
																									month: 'short'
																								})}
																							</span>
																						</h5>
																						<div className="grid gap-4">
																							{Object.entries(markets).map(([marketName, selections]) => {
																								return (
																									(selections as SelectionWithExtra[]).map(s => {
																										return (
																											<div
																												key={s.market_id}
																												className="bg-base-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
																												<div
																													className="flex flex-col space-y-4 md:space-y-0 md:grid md:grid-cols-3">
																													<div
																														className="flex items-center space-x-1">
																														{prioritizedIds.includes(s.market_type_id) && (() => {
																															let emoji = '';
																															if ([1, 26].includes(s.market_type_id)) {
																																emoji = '🥇';
																															} else if ([2, 27].includes(s.market_type_id)) {
																																emoji = '🥈';
																															} else if ([3, 28].includes(s.market_type_id)) {
																																emoji = '🥉';
																															}
																															return (
																																<div
																																	className="text-3xl -mt-1 -ml-2">{emoji}</div>
																															);
																														})()}
																														{!prioritizedIds.includes(s.market_type_id) && (() => {
																															return (
																																<span
																																	className="text-gray-200">{s.market_name}:</span>
																															);
																														})()}
																														<span
																															className="text-gray-200">{s.market_result !== null ? s.market_result : 'N/A'}</span>
																													</div>
																													<div
																														className="flex items-center space-x-2">
																														<svg
																															className="w-4 h-4 text-primary"
																															fill="none"
																															stroke="currentColor"
																															viewBox="0 0 24 24"
																															xmlns="http://www.w3.org/2000/svg">
																															<path
																																strokeLinecap="round"
																																strokeLinejoin="round"
																																strokeWidth={2}
																																d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
																															<path
																																strokeLinecap="round"
																																strokeLinejoin="round"
																																strokeWidth={2}
																																d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
																														</svg>
																														<span
																															className="font-semibold text-gray-400">Points:</span>
																														<span
																															className="text-gray-200">{s.points !== null ? s.points : 'N/A'}</span>
																													</div>
																													<div
																														className="flex items-center space-x-2">
																														<svg
																															className="w-4 h-4 text-primary"
																															fill="none"
																															stroke="currentColor"
																															viewBox="0 0 24 24"
																															xmlns="http://www.w3.org/2000/svg">
																															<path
																																strokeLinecap="round"
																																strokeLinejoin="round"
																																strokeWidth={2}
																																d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
																														</svg>
																														<span
																															className="font-semibold text-gray-400">Prediction:</span>
																														<span
																															className="text-gray-200">{s.result_key}</span>
																													</div>
																												</div>
																											</div>
																										);
																									})
																								);
																							})}
																						</div>
																					</div>
																				);
																			})}
																	</div>
																);
															})}
														</td>
													</tr>
												);
											}
										})()}
									</React.Fragment>
								);
							})}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};