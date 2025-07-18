import React, {useEffect, useState} from 'react';
import {Leaderboard} from '@/app/dashboard/Leaderboard';
import {AddNewLeagueModal} from '@/components/AddNewLeagueModal';
import {JoinLeagueModal} from '@/components/JoinLeagueModal';
import {getLeagues} from '@/libs/api/features';
import {useAuthStore} from '@/libs/stores/authStore';
import {copyToClipboard} from '@/libs/utils';
import {ArrowLeftIcon} from '@heroicons/react/24/solid';
import {useFeatureStore} from '@/libs/stores/categoryStore';

export const Leagues = () => {
	const { user } = useAuthStore();
	const {leagues, setLeagues} = useFeatureStore();
	const [isAddLeagueModalOpen, setIsAddLeagueModalOpen] = useState(false);
	const [isJoinLeagueModalOpen, setIsJoinLeagueModalOpen] = useState(false);
	const [currentlyActiveLeagueId, setCurrentlyActiveLeagueId] = useState<number | null>(null);
	const [currentlyActiveLeagueName, setCurrentlyActiveLeagueName] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const leagues = await getLeagues();
			setLeagues(leagues);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<div className="max-w-5xl mx-auto">
			{!currentlyActiveLeagueId && (
				<div className="flex flex-row gap-2 mt-6 mb-4">
					<button
						className="btn btn-primary btn-sm"
						onClick={() => {
							setIsAddLeagueModalOpen(true);
						}}
					>
						Add League
					</button>
					<button
						className="btn btn-base-100 btn-sm"
						onClick={() => {
							setIsJoinLeagueModalOpen(true);
						}}
					>
						Join League
					</button>
				</div>
			)}

			{isLoading ? (
				<div
					className="flex flex-row justify-center py-4"
				>
					<span className="loading loading-spinner loading-xl"></span>
				</div>
			) : (
				<div>
					{!currentlyActiveLeagueId && leagues.map(l => {
						return (
							<div
								key={l.id.toString()}
								className="border border-base-content/20 shadow-md rounded-md mb-4 py-4 px-8 cursor-pointer"
								onClick={() => {
									setCurrentlyActiveLeagueId(l.id);
									setCurrentlyActiveLeagueName(l.name);
								}}
							>
								<div
									className="flex flex-row items-center justify-between"
								>
									<div>
										<h2
											className="text-xl font-semibold"
										>
											{l.name}
										</h2>
										<p
											className="text-md font-extralight"
										>
											{l.profile_ids.length} {l.profile_ids.length > 1 ? 'members' : 'member'}
										</p>
									</div>

									{l.owner_profile_id === user.id && (
										<button
											onClick={(e) => {
												e.stopPropagation();
												copyToClipboard(l.password);
											}}
											className="btn btn-primary btn-sm"
										>
											Copy invite code
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}



			<div
				className="flex flex-row space-x-2 mt-6"
			>
				{currentlyActiveLeagueId && (
					<button
						className="btn btn-outline btn-sm"
						onClick={() => {
							setCurrentlyActiveLeagueId(null);
							setCurrentlyActiveLeagueName('');
						}}
					>
						<div
							className="flex flex-row items-center space-x-1"
						>
							<ArrowLeftIcon
								className="w-4 h-4 -mb-0.5"
							></ArrowLeftIcon>
							<p>
								Back
							</p>
						</div>
					</button>
				)}

				{currentlyActiveLeagueId && (
					<div>
						<h1
							className="text-2xl font-extrabold ml-2"
						>
							{currentlyActiveLeagueName} league
						</h1>
					</div>

				)}
			</div>
			{currentlyActiveLeagueId && (
				<Leaderboard
					leagueId={currentlyActiveLeagueId}
				/>
			)}

			{/* Modals */}
			<AddNewLeagueModal
				isModalOpen={isAddLeagueModalOpen}
				setIsModalOpen={setIsAddLeagueModalOpen}
				leagues={leagues}
				setLeagues={setLeagues}
			/>

			<JoinLeagueModal
				isModalOpen={isJoinLeagueModalOpen}
				setIsModalOpen={setIsJoinLeagueModalOpen}
				leagues={leagues}
				setLeagues={setLeagues}
			/>

		</div>
	);
};