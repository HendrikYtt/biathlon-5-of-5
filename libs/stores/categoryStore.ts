import { create } from 'zustand';
import {getCategories, getCompetitors} from '@/libs/api/features';
import {Category, DbCompetitor, DbLeague} from '@/types/types';

interface FeatureState {
    isLoading: boolean
    error: string | null
    fetchCategories: () => Promise<void>
    categories: Category[]
    setCategories: (categories: Category[]) => void
	fetchCompetitors: () => Promise<void>
	competitors: DbCompetitor[]
	setCompetitors: (competitors: DbCompetitor[]) => void
	leagues: DbLeague[]
	setLeagues: (leagues: DbLeague[]) => void
	activeTab: number
	setActiveTab: (activeTab: number) => void
}

export const useFeatureStore = create<FeatureState>((set) => ({
	isLoading: true,
	error: null,
	fetchCategories: async () => {
		set({ isLoading: true, error: null });
		try {
			const res = await getCategories();
			set({ categories: res, isLoading: false });
		} catch (error) {
			set({ error: (error as Error).message, isLoading: false });
		}
	},
	categories: [],
	setCategories: (categories) => set({ categories }),
	fetchCompetitors: async () => {
		set({ isLoading: true, error: null });
		try {
			const res = await getCompetitors();
			set({ competitors: res, isLoading: false });
		} catch (error) {
			set({ error: (error as Error).message, isLoading: false });
		}
	},
	competitors: [],
	setCompetitors: (competitors) => set({ competitors }),
	leagues: [],
	setLeagues: (leagues) => set({ leagues }),
	activeTab: 0,
	setActiveTab: (activeTab) => set({ activeTab })
}));

