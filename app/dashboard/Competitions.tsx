import React, {useEffect, useRef, useState} from 'react';
import {
	deleteMarket,
	deleteMatch, getProfiles,
	getSelectionsForProfile, resultMatch, upsertSelections,
} from '@/libs/api/features';
import toast from 'react-hot-toast';
import DropDownSelect from '@/components/DropDownSelect';
import NumberSelect from '@/components/NumberSelect';
import {AddNewCategoryModal} from '@/components/AddNewCategoryModal';
import {AddNewMarketModal, SelectedMatchProps} from '@/components/AddNewMarketModal';
import {useFeatureStore} from '@/libs/stores/categoryStore';
import {useAuthStore} from '@/libs/stores/authStore';
import {Market, OptionsToChooseFromForUser} from '@/types/types';
import {PlusIcon, TrashIcon} from '@heroicons/react/24/outline';
import CompetitionTabs from '@/app/dashboard/CompetitionTabs';
import _, {isEmpty, keyBy, mapValues, orderBy, uniqBy} from 'lodash';
import {SelectionToInsert} from '@/app/api/features/selection/database';
import {
	numberRanges15,
	prioritizedIds,
	threeWayOptions
} from '@/app/api/features/market-type/const';

type SelectionsByMarketId = Record<number, { resultKey: string, type: OptionsToChooseFromForUser }>;

export const Competitions = () => {
	const {isAdminAndAdminMode, adminMode, user, userIdToImpersonate} = useAuthStore();
	const {fetchCategories, categories, competitors, isLoading, activeTab, setActiveTab} = useFeatureStore();

	const [filteredCategories, setFilteredCategories] = useState(categories);

	const [currentlyActiveCategoryId, setCurrentlyActiveCategoryId] = useState(1);

	const [selectionsByMarketId, setSelectionsByMarketId] = useState<SelectionsByMarketId>({});

	const [isAddNewCategoryModalOpen, setIsAddNewCategoryModalOpen] = useState(false);

	const [isDeleteMarketLoading, setIsDeleteMarketLoading] = useState(false);
	const [isResultMatchLoading, setIsResultMatchLoading] = useState(false);

	const [selectedMatchProps, setSelectedMatchProps] = useState<SelectedMatchProps | null>(null);
	const [existingSelectedMatchMarketTypeIds, setExistingSelectedMatchMarketTypeIds] = useState<number[]>([]);

	const [isAddNewMarketModalOpen, setIsAddNewMarketModalOpen] = useState(false);
	const [isTeamMatch, setIsTeamMatch] = useState(false);

	const [changedMatches, setChangedMatches] = useState<Set<number>>(new Set());
	const [changedMarkets, setChangedMarkets] = useState<Set<Market>>(new Set());
	const [loadingSaveMatchId, setLoadingSaveMatchId] = useState(0);

	const handleSelect = (matchId: number, market: Market, value: string | null, optionsType: OptionsToChooseFromForUser) => {
		setSelectionsByMarketId(prevState => {
			return {
				...prevState,
				[market.id]: {
					resultKey: value,
					type: optionsType
				}
			};
		});
		setChangedMarkets((prev) => new Set(prev).add(market));
		setChangedMatches((prev) => new Set(prev).add(matchId));
	};

	const handleNumberSelect = (matchId: number, market: Market, value: string | null, optionsType: OptionsToChooseFromForUser) => {
		setSelectionsByMarketId(prevState => {
			return {
				...prevState,
				[market.id]: {
					resultKey: value,
					type: optionsType
				}
			};
		});
		setChangedMarkets((prev) => new Set(prev).add(market));
		setChangedMatches((prev) => new Set(prev).add(matchId));
	};

	const isSaveEnabledForMatch = (matchId: number) => {
		return changedMatches.has(matchId);
	};

	const fetchAndSetSelections = async () => {
		const selections = await getSelectionsForProfile(userIdToImpersonate);
		if (isEmpty(selections)) {
			return;
		}
		const mapped: SelectionsByMarketId = mapValues(keyBy(selections, 'market_id'), s => {
			return {
				type: s.type,
				resultKey: s.result_key
			};
		});
		setSelectionsByMarketId(mapped);
	};

	useEffect(() => {
		if (categories.length === 0) {
			fetchCategories();
		}
		fetchAndSetSelections();
	}, [categories, userIdToImpersonate]);

	useEffect(() => {
		const filtered = categories.filter(c => c.is_active);
		setFilteredCategories(filtered);
		const categoriesToDisplay = isAdminAndAdminMode() ? categories : filtered;
		if (categoriesToDisplay.length > 0) {
			const currentTimestamp = new Date().toISOString();
			const cat = categoriesToDisplay.filter(c => c.matches.length).find(c => {
				const latestMatch = c.matches[c.matches.length - 1];
				// 2024-11-26T20:34:21.030Z
				return new Date(latestMatch.start_time).toISOString() > currentTimestamp;
			});
			if (cat) {
				const index = categoriesToDisplay.indexOf(cat);
				setCurrentlyActiveCategoryId(cat.id);
				setActiveTab(index);
			}
		}
	}, [categories, adminMode]);


	const categoriesToDisplay = isAdminAndAdminMode() ? categories : filteredCategories;

	const currentlyActiveCategory = categoriesToDisplay.find(c => c.id === currentlyActiveCategoryId) || categoriesToDisplay[0];

	const saveSelectionsForMatch = async (matchId: number) => {
		try {
			setLoadingSaveMatchId(matchId);
			const match = currentlyActiveCategory.matches.find(m => m.id === matchId);
			if (!match) {
				return;
			}

			const matchMarkets = Array.from(changedMarkets).filter(m => m.match_id === matchId);
			const entries: SelectionToInsert[] = Object.entries(selectionsByMarketId)
				.filter(s => {
					const matchMarketIds = matchMarkets.map(m => m.id);
					return matchMarketIds.includes(parseInt(s[0]));
				})
				.map(s => {
					return {
						market_id: parseInt(s[0]),
						profile_id: userIdToImpersonate || user.id,
						points: null,
						type: s[1].type,
						result_key: s[1].resultKey
					};
				});
			await upsertSelections(entries, matchId);

			setChangedMatches((prev) => {
				const newSet = new Set(prev);
				newSet.delete(matchId);
				return newSet;
			});
			setChangedMarkets((prev) => {
				const newSet = new Set(prev);
				currentlyActiveCategory.matches.filter(m => m.id === matchId).flatMap(m => m.markets.forEach(market => {
					newSet.delete(market);
				}));
				return newSet;
			});

			toast.success('Selections saved for this event!');
		} finally {
			setLoadingSaveMatchId(0);
		}
	};

	return (
		<div className="py-2 min-h-screen">
			<div className="max-w-8xl mx-auto">
				<CompetitionTabs
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					currentlyActiveCategoryId={currentlyActiveCategoryId}
					setCurrentlyActiveCategoryId={setCurrentlyActiveCategoryId}
					showCheckboxes={true}
				/>

				{currentlyActiveCategory && (
					<div>
						<div className="flex justify-between items-center mb-4">
							<div>
								<h2 className="text-2xl font-bold mt-4 mb-2">{currentlyActiveCategory.name} | <span
									className="text-xl font-light">{currentlyActiveCategory.location}</span></h2>
								<p>
									{new Date(currentlyActiveCategory.start_time).toLocaleDateString('en-GB', {
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									})}
								</p>
							</div>
						</div>

						{isLoading ? (
							<div className="flex flex-col items-center justify-center">
								<span className="loading loading-spinner loading-xl"></span>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

								{currentlyActiveCategory.matches.map((match) => {

									return (
										<div key={match.id}
											className="bg-base-200 rounded-lg shadow-lg overflow-hidden">
											<div className="p-4">
												<div className="flex justify-between items-start mb-4">
													<div className="w-3/4 flex items-center"
														onClick={() => navigator.clipboard.writeText(match.biathlon_race_id)}
													>
														<span
															className="text-white font-medium text-xl">{match.name}</span>
													</div>
													<div className="w-1/4mt-1">
														<p className="text-right text-primary-400 text-sm">
															{new Date(match.start_time).toLocaleString('en-GB', {
																hour: '2-digit',
																minute: '2-digit',
																day: '2-digit',
																month: 'short'
															})}
														</p>
														{isAdminAndAdminMode() && (
															<div className="flex justify-end">
																<button
																	className="btn btn-primary btn-sm mt-2 "
																	onClick={async () => {
																		setIsResultMatchLoading(true);
																		try {
																			await resultMatch(match.biathlon_race_id);
																		} catch (e) {
																			setIsResultMatchLoading(false);
																			return;
																		}
																		setIsResultMatchLoading(false);
																		toast.success('Match resulted!');
																	}}
																>
																	{isResultMatchLoading
																		? (<span
																			className="loading loading-spinner loading-xs"></span>)
																		: (<p>Result</p>)
																	}
																</button>
															</div>
														)}
													</div>
												</div>

												<div className="mt-4 space-y-4">
													{match.markets.sort((a, b) => {
														const aPriority = prioritizedIds.includes(a.market_type_id) ? prioritizedIds.indexOf(a.market_type_id) : Infinity;
														const bPriority = prioritizedIds.includes(b.market_type_id) ? prioritizedIds.indexOf(b.market_type_id) : Infinity;

														if (aPriority !== bPriority) {
															return aPriority - bPriority;
														}

														return a.market_type_id - b.market_type_id;
													}).map((market) => {
														const isTeamMarket = market.options_to_choose_from_for_user === 'Team';
														const options = orderBy(uniqBy(competitors.filter(c => {
															if (isTeamMarket) {
																return c.is_team && c.gender === match.gender;
															} else {
																return !c.is_team && c.gender === match.gender;
															}
														}).map(c => {
															return {
																value: c.name,
																label: c.name
															};
														}), 'label'), 'label');
														return (
															<div key={market.id} className="w-full">
																<div className="flex items-center mb-2 gap-2">
																	<p className="text-sm ml-1 mb-1">{market.name}</p>
																	{isAdminAndAdminMode() && (
																		<div className="flex gap-2 ml-1">
																			{isDeleteMarketLoading
																				? (
																					<span
																						className="loading loading-spinner loading-xs"></span>
																				)
																				: (
																					<TrashIcon
																						className="btn btn-error btn-xs p-1"
																						onClick={async () => {
																							setIsDeleteMarketLoading(true);
																							await deleteMarket(market.id);
																							await fetchCategories();
																							setIsDeleteMarketLoading(false);
																							toast.success('Market deleted!');
																						}}
																					/>
																				)}

																		</div>
																	)}
																</div>
																{['Team', 'Competitor'].includes(market.options_to_choose_from_for_user) && (
																	<DropDownSelect
																		value={selectionsByMarketId[market.id]?.resultKey || ''}
																		disabled={!isAdminAndAdminMode() && new Date() > new Date(match.start_time)}
																		// disabled={false}
																		placeHolder={'Select'}
																		options={options}
																		onChange={(value) => handleSelect(match.id, market, value, market.options_to_choose_from_for_user)}
																	/>
																)}
																{market.options_to_choose_from_for_user === 'PositiveNumber' && (
																	<NumberSelect
																		disabled={!isAdminAndAdminMode() && new Date() > new Date(match.start_time)}
																		// disabled={false}
																		value={selectionsByMarketId[market.id]?.resultKey || ''}
																		min={0}
																		max={100}
																		onChange={(value) => handleNumberSelect(match.id, market, value, market.options_to_choose_from_for_user)}
																	/>
																)}
																{market.options_to_choose_from_for_user === 'Number' && (
																	<NumberSelect
																		disabled={!isAdminAndAdminMode() && new Date() > new Date(match.start_time)}
																		// disabled={false}
																		value={selectionsByMarketId[market.id]?.resultKey || ''}
																		min={-100}
																		max={100}
																		onChange={(value) => handleNumberSelect(match.id, market, value, market.options_to_choose_from_for_user)}
																	/>
																)}
																{market.options_to_choose_from_for_user === 'NumberRange15' && (
																	<DropDownSelect
																		value={selectionsByMarketId[market.id]?.resultKey || ''}
																		disabled={!isAdminAndAdminMode() && new Date() > new Date(match.start_time)}
																		// disabled={false}
																		placeHolder={'Select'}
																		options={numberRanges15}
																		onChange={(value) => handleSelect(match.id, market, value, market.options_to_choose_from_for_user)}
																	/>
																)}
																{market.options_to_choose_from_for_user === 'ThreeWay' && (
																	<DropDownSelect
																		value={selectionsByMarketId[market.id]?.resultKey || ''}
																		disabled={!isAdminAndAdminMode() && new Date() > new Date(match.start_time)}
																		// disabled={false}
																		placeHolder={'Select'}
																		options={threeWayOptions}
																		onChange={(value) => handleSelect(match.id, market, value, market.options_to_choose_from_for_user)}
																	/>
																)}
															</div>
														);
													}
													)}
													{!isAdminAndAdminMode() && (
														<button
															className="btn btn-primary btn-sm mt-4 w-full"
															disabled={!isSaveEnabledForMatch(match.id) || match.id === loadingSaveMatchId}
															onClick={() => {
																saveSelectionsForMatch(match.id);
															}}
														>
															{match.id === loadingSaveMatchId ? (
																<span
																	className="loading loading-spinner loading-xs"></span>
															) : (
																'Save'
															)}
														</button>
													)}
												</div>

												{isAdminAndAdminMode() && (
													<div className="mt-4 flex justify-end space-x-2">
														<button
															className="btn btn-primary btn-xs"
															onClick={() => {
																setIsAddNewMarketModalOpen(true);
																setIsTeamMatch(match.is_team);
																const {id, gender, is_team} = match;
																setExistingSelectedMatchMarketTypeIds(match.markets.map(m => m.market_type_id));
																setSelectedMatchProps({
																	id,
																	gender,
																	is_team
																});
															}}
														>
															<PlusIcon className="h-3 w-3 mr-1"/>
                                                            Add Question
														</button>
														{/*<button*/}
														{/*	className="btn btn-error btn-xs"*/}
														{/*	onClick={async () => {*/}
														{/*		await deleteMatch(match.id);*/}
														{/*		await fetchCategories();*/}
														{/*		toast.success('Event deleted!');*/}
														{/*	}}*/}
														{/*>*/}
														{/*	<TrashIcon className="h-3 w-3 mr-1"/>*/}
														{/*		Delete*/}
														{/*</button>*/}
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}

					</div>
				)}

			</div>

			{/* Modals */}
			<AddNewCategoryModal
				isModalOpen={isAddNewCategoryModalOpen}
				setIsModalOpen={setIsAddNewCategoryModalOpen}
			/>
			{selectedMatchProps && (
				<AddNewMarketModal
					existingMarketTypeIds={existingSelectedMatchMarketTypeIds}
					isTeam={isTeamMatch}
					selectedMatchProps={selectedMatchProps}
					setSelectedMatchProps={setSelectedMatchProps}
					isModalOpen={isAddNewMarketModalOpen}
					setIsModalOpen={setIsAddNewMarketModalOpen}
				/>
			)}
		</div>
	);
};