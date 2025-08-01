import { createBrowserClient } from '@supabase/ssr';
import {SupabaseClient} from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getOrCreateClient(): SupabaseClient {
	if (supabase === null) {
		supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
		);
	}
	return supabase;
}