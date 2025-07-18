'use client';
import {addLeague, getLeagues} from '@/libs/api/features';
import Modal from '@/components/Modal';
import React, {useEffect, useState} from 'react';
import {LeagueToInsertRequest} from '@/app/api/features/league/database';
import toast from 'react-hot-toast';
import {z} from 'zod';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {DbLeague} from '@/types/types';
import {copyToClipboard} from '@/libs/utils';

interface ModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	leagues: DbLeague[];
	setLeagues: React.Dispatch<React.SetStateAction<DbLeague[]>>
}

const schema = z.object({
	name: z.string().min(1, 'League name is required'),
});

type FormData = z.infer<typeof schema>;

export const AddNewLeagueModal = ({ isModalOpen, setIsModalOpen, leagues, setLeagues }: ModalProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isLeaguePasswordModalOpen, setIsLeaguePasswordModalOpen] = useState(false);

	const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: ''
		}
	});

	useEffect(() => {
		if (!isModalOpen) {
			reset();
		}
	}, [isModalOpen]);

	const [leaguePassword, setLeaguePassword] = useState('');
	const [leagueName, setLeagueName] = useState('');

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);
		try {
			const leagueData: LeagueToInsertRequest = {
				name: data.name
			};
			
			const resp = await addLeague(leagueData);
			setLeaguePassword(resp[0].password);
			setLeagueName(resp[0].name);
			setIsLeaguePasswordModalOpen(true);
			setIsModalOpen(false);
			setLeagues(await getLeagues());
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
				isModalOpen={isLeaguePasswordModalOpen}
				setIsModalOpen={setIsLeaguePasswordModalOpen}
				title={`Invite your friends to ${leagueName}`}
				content={
					<div className="">
						<div className="space-y-4">
							<div>
								<p className="mb-2 font-medium">
									League code
								</p>
								<p className="text-sm font-light">Your friends can join
									<span className="text-primary font-bold">
										{' '}{leagueName}{' '}
									</span>
									league by using this code:</p>
							</div>

							<div className="flex gap-4 items-center">
								<div className="flex-1 p-3 border border-dashed border-gray-500 rounded-md text-xl max-w-sm font-extrabold font-mono">
									{leaguePassword}
								</div>
								<button
									onClick={() => copyToClipboard(leaguePassword)}
									className="btn btn-primary"
								>
									Copy code
								</button>
							</div>
						</div>
					</div>
				}
			/>
			<Modal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				title="Add new league"
				content={
					<form onSubmit={handleSubmit(onSubmit)} className="p-4">
						<div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
							<div className="flex-1">
								<label className="block text-sm font-medium mb-2">
									League Name
								</label>
								<Controller
									name="name"
									control={control}
									render={({field}) => (
										<input
											{...field}
											type="text"
											className="input input-bordered w-full"
										/>
									)}
								/>
								{errors.name && <p className="text-red-500 text-xs mt-2">{errors.name.message}</p>}
							</div>
							<div>
								<button
									type="submit"
									className="btn btn-primary mt-4 md:mt-0"
									disabled={isLoading}
								>
									{isLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Add'}
								</button>
							</div>
						</div>
					</form>

				}
			/>
		</div>
	);
};