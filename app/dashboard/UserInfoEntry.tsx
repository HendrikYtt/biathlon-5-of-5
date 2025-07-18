'use client';
import '/node_modules/flag-icons/css/flag-icons.min.css';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import DropDownSelect from '@/components/DropDownSelect';
import {z} from 'zod';
import {getCompetitors, updateUserInfo} from '@/libs/api/features';
import {getOrCreateClient} from '@/libs/supabase/client';
import {useAuthStore} from '@/libs/stores/authStore';
import {toast} from 'react-hot-toast';
import {hasProvidedInfoKey, hasProvidedInfoValue} from '@/app/dashboard/const';
import {countries} from '@/app/user-info/const';

const schema = z.object({
	username: z.string().min(1, 'Username is required'),
	country: z.string().min(1, 'Country is required'),
	favorite_athlete: z.string().min(1, 'Favorite athlete is required'),
});

type FormData = z.infer<typeof schema>;

interface UserInfoEntryProps {
	username?: string;
	country?: string;
	favorite_athlete?: string;
}

export const UserInfoEntry = ({username, country, favorite_athlete}: UserInfoEntryProps) => {
	const { setUser, user } = useAuthStore();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			username: username || '',
			country: country || '',
			favorite_athlete: favorite_athlete || '',
		}
	});

	useEffect(() => {
		const fetchData = async () => {
			const competitors = await getCompetitors();
			const mapped = competitors.map(c => {
				return {
					value: c.name,
					label: c.name
				};
			});
			setData(mapped);
		};
		fetchData();
	}, []);

	const onSubmit = async (data: FormData) => {
		if (!user) {
			return;
		}
		setIsLoading(true);
		try {
			const supabase = getOrCreateClient();
			await updateUserInfo({
				id: user.id,
				username: data.username,
				country: data.country,
				favorite_athlete: data.favorite_athlete,
			});

			await supabase.auth.updateUser({
				data: {
					...data,
					[hasProvidedInfoKey]: hasProvidedInfoValue
				}}
			);
			const updatedUser = await supabase.auth.getUser();
			setUser(updatedUser.data.user);
			setIsLoading(false);
			toast.success('Info updated!');
		} catch (e) {
			toast.error('Could not update info');
			setIsLoading(false);
		}
	};

	return (
		<div className="p-4 mx-auto">
			<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-8">
				Let us know more about you
			</h1>
			<div className="mx-auto">
				<form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto">
					<div className="flex flex-col space-y-4">
						<div>
							<div className="mb-1">
								<span className="label-text">Username</span>
							</div>
							<Controller
								name="username"
								control={control}
								render={({field}) => (
									<input
										{...field}
										type="text"
										className="input input-bordered w-full"
									/>
								)}
							/>
							{errors.username && <p className="text-red-500 text-xs mt-2">{errors.username.message}</p>}
						</div>

						<div>
							<div className="mb-1">
								<span className="label-text">Country</span>
								{/*<span className="fi fi-gr"></span>*/}
							</div>
							<Controller
								name="country"
								control={control}
								render={({field}) => (
									<DropDownSelect
										value={field.value}
										disabled={false}
										placeHolder={'Select'}
										options={countries}
										onChange={field.onChange}
									/>
								)}
							/>
							{errors.country && <p className="text-red-500 text-xs mt-2">{errors.country.message}</p>}
						</div>

						<div>
							<div className="mb-1">
								<span className="label-text">Favorite athlete</span>
							</div>
							<Controller
								name="favorite_athlete"
								control={control}
								render={({field}) => (
									<DropDownSelect
										value={field.value.toString()}
										disabled={false}
										placeHolder={'Select'}
										options={data}
										onChange={field.onChange}
									/>
								)}
							/>
							{errors.favorite_athlete &&
								<p className="text-red-500 text-xs mt-2">{errors.favorite_athlete.message}</p>}
						</div>

						<div>
							<button
								type="submit"
								className="btn btn-primary w-full mt-4"
								disabled={isLoading}
							>
								{isLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Save'}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};