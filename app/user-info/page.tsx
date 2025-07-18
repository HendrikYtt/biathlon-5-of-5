'use client';
import React, { Suspense } from 'react';
import Header from '@/components/Header';
import { useAuthStore } from '@/libs/stores/authStore';
import {UserInfoEntry} from '@/app/dashboard/UserInfoEntry';

export const dynamic = 'force-dynamic';

export default function UserInfo() {
	const { user } = useAuthStore();

	return (
		<>
			<Suspense>
				<Header />
			</Suspense>
			{user && (
				<UserInfoEntry
					username={user.user_metadata.username}
					country={user.user_metadata.country}
					favorite_athlete={user.user_metadata.favorite_athlete}
				/>
			)}
		</>
	);
}