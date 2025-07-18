import apiClient from '@/libs/api/config';

const baseUrl = '/is-admin';

export const getIsAdmin = async (): Promise<{ isAdmin: boolean }> => {
	return await apiClient.get(baseUrl);
};