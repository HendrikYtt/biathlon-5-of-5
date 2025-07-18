import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { getOrCreateClient } from '@/libs/supabase/client';
import { getIsAdmin } from '@/libs/api/is-admin';
import {DbProfile} from '@/types/types';

interface AuthState {
	user: User | null;
	isLoading: boolean;
	error: string | null;
	isAdmin: boolean;
	fetchUser: () => Promise<void>;
	setUser: (user: User | null) => void;
	adminMode: boolean;
	setAdminMode: () => void;
	isAdminAndAdminMode: () => boolean;
	userIdToImpersonate: string | null;
	setUserIdToImpersonate: (userId: string | null) => void;
	profiles: DbProfile[];
	setProfiles: (profiles: DbProfile[]) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	isLoading: false,
	error: null,
	isAdmin: false,
	fetchUser: async () => {
		const { user } = get();
		if (user) return;

		set({ isLoading: true, error: null });
		try {
			const supabase = getOrCreateClient();
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();
			if (error) throw error;
			const { isAdmin } = await getIsAdmin();
			set({ user, isAdmin, isLoading: false });
		} catch (error) {
			set({ error: (error as Error).message, isLoading: false });
		}
	},
	setUser: (user) => set({ user }),
	adminMode: true,
	setAdminMode: () => set((state) => ({ adminMode: !state.adminMode })),
	isAdminAndAdminMode: () => get().isAdmin && get().adminMode,
	userIdToImpersonate: null,
	setUserIdToImpersonate: (userId) => set({userIdToImpersonate: userId }),
	profiles: [],
	setProfiles: (profiles: DbProfile[]) => set({ profiles: profiles }),
}));
