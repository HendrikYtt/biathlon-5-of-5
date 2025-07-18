'use client';
import React, { Suspense, useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Competitions } from '@/app/dashboard/Competitions';
import { useAuthStore } from '@/libs/stores/authStore';
import { Settings } from '@/app/dashboard/Settings';
import { useFeatureStore } from '@/libs/stores/categoryStore';
import {Rules} from '@/app/dashboard/Rules';
import {UserInfoEntry} from '@/app/dashboard/UserInfoEntry';
import {hasProvidedInfoKey, hasProvidedInfoValue} from '@/app/dashboard/const';
import {Leagues} from '@/app/dashboard/Leagues';

export const dynamic = 'force-dynamic';

type TabType = 'Competitions' | 'Leagues' | 'Rules' | 'Settings';

export default function Dashboard() {
	const { isAdminAndAdminMode, user, isLoading } = useAuthStore();
	const { fetchCompetitors } = useFeatureStore();

	const [selectedTab, setSelectedTab] = useState<TabType>('Competitions');

	useEffect(() => {
		fetchCompetitors();
	}, []);

	const TabItem = ({ label }: { label: TabType }) => (
		<button
			className={`
                px-2 py-2 text-sm font-medium transition-colors duration-200
                relative
                ${
		selectedTab === label
			? 'text-primary'
			: 'hover:text-primary'
		}
                group
            `}
			onClick={() => setSelectedTab(label)}
		>
			{label}
			<span
				className={`
                    absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400
                    transform scale-x-0 transition-transform duration-300 origin-left
                    ${selectedTab === label ? 'scale-x-100' : 'group-hover:scale-x-100'}
                `}
			/>
		</button>
	);

	return (
		<>
			<Suspense>
				<Header/>
			</Suspense>
			{!user && isLoading && (
				<div className="flex flex-col items-center justify-center">
					<span className="loading loading-spinner loading-xl"></span>
				</div>
			)}
			{
				user && user.user_metadata[hasProvidedInfoKey] !== hasProvidedInfoValue && !isLoading && (
					<UserInfoEntry/>
				)
			}
			{
				user?.user_metadata[hasProvidedInfoKey] === hasProvidedInfoValue && !isLoading && (
					<main className="min-h-screen px-6 mt-6 lg:mt-4">
						<section className="max-w-7xl mx-auto">
							<div className="flex space-x-4 border-b border-gray-700 mb-2">
								<TabItem label="Competitions"/>
								<TabItem label="Leagues"/>
								<TabItem label="Rules"/>
								{/*{isAdminAndAdminMode() && <TabItem label="Settings"/>}*/}
							</div>

							{selectedTab === 'Competitions' && <Competitions/>}
							{selectedTab === 'Leagues' && <Leagues/>}
							{selectedTab === 'Rules' && <Rules/>}
							{selectedTab === 'Settings' && isAdminAndAdminMode() && <Settings/>}
						</section>
					</main>
				)
			}
		</>
	);
}