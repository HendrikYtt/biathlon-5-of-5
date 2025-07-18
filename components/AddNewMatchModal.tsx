'use client';
import Modal from '@/components/Modal';
import React, {useState} from 'react';
import toast from 'react-hot-toast';
import {useFeatureStore} from '@/libs/stores/categoryStore';
import {MatchToInsert} from '@/app/api/features/match/database';
import {addMatch} from '@/libs/api/features';

interface ModalProps {
    categoryId: number;
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddNewMatchModal = ({ categoryId, isModalOpen, setIsModalOpen }: ModalProps) => {
	const {fetchCategories} = useFeatureStore();
	const defaultValue: MatchToInsert = {name: '', category_id: categoryId, biathlon_race_id: null, start_time: new Date().toISOString(),is_team: false, gender: 'M'};
	const [matchToInsert, setMatchToInsert] = useState<MatchToInsert>(defaultValue);

	return (
		<Modal
			isModalOpen={isModalOpen}
			setIsModalOpen={setIsModalOpen}
			title="Add new event"
			content={
				<div className="p-4">
					<div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-500 mb-1">
                                Event Name
							</label>
							<input
								type="text"
								className="input input-bordered w-full"
								value={matchToInsert.name || ''}
								onChange={(e) =>
									setMatchToInsert((prevState) => ({
										...prevState,
										name: e.target.value,
									}))
								}
							/>
						</div>
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-500 mb-1">
                                Start Time
							</label>
							<input
								type="datetime-local"
								className="input input-bordered w-full"
								value={matchToInsert.start_time}
								onChange={(e) => {
									const value = e.target.value;
									setMatchToInsert((prevState) => ({
										...prevState,
										start_time: value,
									}));
								}}
							/>
						</div>
						<div>
							<button
								className="btn btn-accent mt-4 md:mt-0"
								onClick={async () => {
									await addMatch({...matchToInsert, category_id: categoryId});
									await fetchCategories();
									setIsModalOpen(false);
									setMatchToInsert(defaultValue);
									toast.success('Event added!');
								}}
							>
                            Add
							</button>
						</div>
					</div>
				</div>

			}
		/>
	);
};