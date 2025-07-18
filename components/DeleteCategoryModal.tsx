'use client';
import {deleteCategory} from '@/libs/api/features';
import Modal from '@/components/Modal';
import React from 'react';
import toast from 'react-hot-toast';
import {useFeatureStore} from '@/libs/stores/categoryStore';

interface ModalProps {
    categoryIdToDelete: number;
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DeleteCategoryModal = ({ isModalOpen, setIsModalOpen, categoryIdToDelete }: ModalProps) => {
	const {fetchCategories} = useFeatureStore();

	return (
		<Modal
			isModalOpen={isModalOpen}
			setIsModalOpen={setIsModalOpen}
			title="Are you sure?"
			content={
				<div className="p-4">
					<div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
						<div className="flex justify-end gap-4 w-full">
							<button
								className="btn btn-error mt-4 md:mt-0"
								onClick={async () => {
									await deleteCategory(categoryIdToDelete);
									await fetchCategories();
									setIsModalOpen(false);
									toast.success('Category deleted');
								}}
							>
                                Delete
							</button>
							<button
								className="btn btn-accent mt-4 md:mt-0"
								onClick={async () => {
									setIsModalOpen(false);
								}}
							>
                                Cancel
							</button>
						</div>
					</div>
				</div>

			}
		/>
	);
};