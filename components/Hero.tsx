'use client';
import React, {useEffect, useState} from 'react';
import Image from 'next/image';
import config from '@/config';
import {useAuthStore} from '@/libs/stores/authStore';
import {getSelectionsCount} from '@/libs/api/features';

export const Hero = () => {
	const { user } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const [selectionsCount, setSelectionsCount] = useState<number | null>(null);

	const handleRedirect = () => {
		setIsLoading(true);
		window.location.href = config.auth.callbackUrl;
	};

	useEffect(() => {
		const fetchData = async () => {
			const resp = await getSelectionsCount();
			setSelectionsCount(resp.count);
			console.log('resp',resp);
		};
		fetchData();
	}, []);

	return (
		<section className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
			<div
				className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start"
			>
				<h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
					Add excitement to biathlon
				</h1>
				<p className="text-lg opacity-80 leading-relaxed mt-4">
					Predict biathlon competition winners and compete with your friends, <b className="text-primary text-xl">{selectionsCount} predictions</b> already done!
				</p>

				<button
					onClick={handleRedirect}
					className="btn btn-primary btn-wide text-xl"
					disabled={isLoading}
				>
					{isLoading ? (
						<span className="loading loading-spinner loading-xl"></span>
					) : (
						<p>{user ? 'Start predicting!' : 'Get started'}</p>
					)}
				</button>
			</div>
			<div className="lg:w-100">
				<Image
					src="https://www.gannett-cdn.com/-mm-/091190c344f99fabe8e83297172ad0de8a040519/c=0-156-3072-1892/local/-/media/2018/01/30/USATODAY/USATODAY/636529149648182788-EPA-ITALY-BIATHLON-WORLD-CUP-96769415.JPG?width=3072&height=1736&fit=crop&format=pjpg&auto=webp"
					alt="Product Demo"
					className="w-full rounded-md"
					priority={true}
					width={1000}
					height={1000}
				/>
			</div>
		</section>
	);
};
