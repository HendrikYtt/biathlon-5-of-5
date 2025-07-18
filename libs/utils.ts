import {compare} from 'bcrypt';
import toast from 'react-hot-toast';

export const isPasswordValid = async (incomingPassword: string, existingPassword: string) => {
	return incomingPassword === existingPassword;
	// return await compare(incomingPassword, existingPassword);
};

const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const generateLeaguePassword = (): string => {
	// Create a timestamp-based component to help avoid collisions
	const timestamp = Date.now().toString(36);

	let result = '';
	// Generate 10 random characters
	for (let i = 0; i < 10; i++) {
		// Use combined entropy from crypto and timestamp
		const timestampChar = timestamp[i % timestamp.length];
		const randomIndex = Math.floor(
			(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) *
			charset.length
		);
		// XOR the random index with the timestamp char code to add more randomness
		const finalIndex = (randomIndex ^ timestampChar.charCodeAt(0)) % charset.length;
		result += charset[finalIndex];
	}

	return result;
};

export const copyToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		toast.success('Code copied!');
	} catch (err) {
		console.error('Failed to copy text:', err);
	}
};