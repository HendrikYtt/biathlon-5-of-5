'use client';
import {addCategory} from '@/libs/api/features';
import Modal from '@/components/Modal';
import React, {useState} from 'react';
import {CategoryToInsert} from '@/app/api/features/category/database';
import toast from 'react-hot-toast';
import {useFeatureStore} from '@/libs/stores/categoryStore';

interface ModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddNewCategoryModal = ({ isModalOpen, setIsModalOpen }: ModalProps) => {
	const {fetchCategories} = useFeatureStore();
	const defaultValue: CategoryToInsert = {name: '', biathlon_event_id: null, start_time: new Date().toISOString(), location: '', is_active: true};
	const [categoryToInsert, setCategoryToInsert] = useState<CategoryToInsert>(defaultValue);

	return (
		<Modal
			isModalOpen={isModalOpen}
			setIsModalOpen={setIsModalOpen}
			title="Add new competition"
			content={
				<div className="p-4">
					<div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-500 mb-1">
                                Competition Name
							</label>
							<input
								type="text"
								className="input input-bordered w-full"
								value={categoryToInsert.name || ''}
								onChange={(e) =>
									setCategoryToInsert((prevState) => ({
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
								value={categoryToInsert.start_time}
								onChange={(e) => {
									const value = e.target.value;
									setCategoryToInsert((prevState) => ({
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
									await addCategory(categoryToInsert);
									await fetchCategories();
									setIsModalOpen(false);
									setCategoryToInsert(defaultValue);
									toast.success('Category added!');
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