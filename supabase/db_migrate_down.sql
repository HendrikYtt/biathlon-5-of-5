-- Drop the selections table
DROP TABLE IF EXISTS selection;

-- Drop the markets table
DROP TABLE IF EXISTS market;

-- Drop the matches table
DROP TABLE IF EXISTS match;

-- Drop the categories table
DROP TABLE IF EXISTS category;

-- Drop the competitors table
DROP TABLE IF EXISTS competitor;

-- Drop the competitors table
DROP TABLE IF EXISTS league;

DELETE FROM supabase_migrations.schema_migrations WHERE name = 'features';






-- Drop the profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;
-- Drop the handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Drop the update_profiles_updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Drop the on_auth_user_created trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the update_updated_at function
DROP FUNCTION IF EXISTS update_updated_at;

DELETE FROM supabase_migrations.schema_migrations WHERE name = 'profiles';