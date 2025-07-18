import React, { useState } from 'react';
import { useFeatureStore } from '@/libs/stores/categoryStore';
import {useAuthStore} from '@/libs/stores/authStore';
import toast from 'react-hot-toast';
import {updateCategoryIsActive} from '@/libs/api/features';

interface CompetitionTabsProps {
	activeTab: number;
	setActiveTab: React.Dispatch<React.SetStateAction<number>>;
	currentlyActiveCategoryId: number;
	setCurrentlyActiveCategoryId: React.Dispatch<React.SetStateAction<number>>;
	showCheckboxes: boolean;
}

const CompetitionTabs = ({activeTab, setActiveTab, setCurrentlyActiveCategoryId, showCheckboxes}: CompetitionTabsProps) => {
	const { isAdminAndAdminMode } = useAuthStore();
	const { categories, fetchCategories } = useFeatureStore();
	const [hoveredTab, setHoveredTab] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
	};

	const tabs = categories.map((c) => ({
		isActive: c.is_active,
		categoryId: c.id,
		label: c.location,
		content: formatDate(c.start_time),
		startTime: new Date(c.start_time)
	}));

	const filteredTabs = tabs.filter(t => {
		return t.isActive;
	});

	const handleUpdateCategoryIsActive = async (categoryId: number, isActive: boolean) => {
		setIsLoading(true);
		try {
			await updateCategoryIsActive({id: categoryId, is_active: isActive});
			await fetchCategories();
		} finally {
			setIsLoading(false);
		}
	};

	const tabsToDisplay = isAdminAndAdminMode() ? tabs : filteredTabs;

	return (
		<div className="pb-2 overflow-x-auto">
			<div className="flex space-x-1 border-b border-gray-700 relative min-w-max">
				{tabsToDisplay.map((tab, index) => (
					<button
						key={index}
						className={`pb-2 px-2 text-sm font-medium transition-colors duration-200 relative hover:text-primary flex-shrink-0 ${
							activeTab === index ? 'text-primary' : 'hover:text-gray-100'
						}`}
						onClick={() => {
							setActiveTab(index);
							setCurrentlyActiveCategoryId(tab.categoryId);
						}}
						onMouseEnter={() => setHoveredTab(index)}
						onMouseLeave={() => setHoveredTab(null)}
					>
						<div className="whitespace-nowrap">{tab.label}</div>
						<div className={'mt-1 text-xs'}>
							{tab.content}
						</div>
						{isAdminAndAdminMode() && showCheckboxes && (
							<input
								type="checkbox"
								checked={tab.isActive}
								disabled={isLoading}
								className="mt-1 w-6 h-6 cursor-pointer"
								onChange={async () => {
									await handleUpdateCategoryIsActive(tab.categoryId, !tab.isActive);
									toast.success(`Competition ${tab.isActive ? 'disabled' : 'enabled'}`);
								}}
								onClick={(e) => e.stopPropagation()}
							/>
						)}
						<span
							className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 ease-out origin-left z-10 ${
								activeTab === index || hoveredTab === index ? 'scale-x-100' : 'scale-x-0'
							}`}
						/>
					</button>
				))}
			</div>
		</div>
	);
};

export default CompetitionTabs;