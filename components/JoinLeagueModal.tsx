'use client';
import {getLeagues, joinLeague} from '@/libs/api/features';
import Modal from '@/components/Modal';
import React, {useEffect, useState} from 'react';
import {JoinLeagueRequest} from '@/app/api/features/league/database';
import toast from 'react-hot-toast';
import {z} from 'zod';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {DbLeague} from '@/types/types';

interface ModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	leagues: DbLeague[];
	setLeagues: React.Dispatch<React.SetStateAction<DbLeague[]>>
}

const schema = z.object({
	password: z.string().min(1, 'League password is required'),
});

type FormData = z.infer<typeof schema>;

export const JoinLeagueModal = ({ isModalOpen, setIsModalOpen, leagues, setLeagues }: ModalProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			password: ''
		}
	});

	useEffect(() => {
		if (!isModalOpen) {
			reset();
		}
	}, [isModalOpen]);

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);
		try {
			const leagueData: JoinLeagueRequest = {
				password: data.password
			};
			
			await joinLeague(leagueData);

			setLeagues(await getLeagues());
			setIsModalOpen(false);
			toast.success('League added!');
		} catch (error) {
			toast.error('Failed to add league');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<Modal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				title="Join league"
				content={
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
							<div className="flex-1">
								<label className="block text-sm font-medium mb-2">
									League password
								</label>
								<Controller
									name="password"
									control={control}
									render={({field}) => (
										<input
											{...field}
											type="text"
											className="input input-bordered w-full"
										/>
									)}
								/>
								{errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
							</div>
							<div>
								<button
									type="submit"
									className="btn btn-primary mt-4 md:mt-0"
									disabled={isLoading}
								>
									{isLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Join'}
								</button>
							</div>
						</div>
					</form>

				}
			/>
		</div>
	);
};