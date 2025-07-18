-- Create TimeStamps type for consistency (if your database supports custom types)
-- Otherwise, include the timestamps in each table directly.

-- Table: competitors
CREATE TABLE competitor (
    name TEXT NOT NULL,
    ibu_id TEXT NOT NULL,
    gender TEXT NOT NULL,
    is_team BOOLEAN NOT NULL,
    extra_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (ibu_id)
);

-- Table: categories
CREATE TABLE category (
    id SERIAL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    biathlon_event_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (biathlon_event_id)
);

-- Table: matches
CREATE TABLE match (
    id SERIAL,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    biathlon_race_id TEXT,
    gender TEXT NOT NULL,
    is_team BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (biathlon_race_id)
);

-- Table: markets
CREATE TABLE market (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    options_to_choose_from_for_user TEXT NOT NULL,
    result TEXT,
    market_type_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table: selections
CREATE TABLE selection (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    market_id INTEGER NOT NULL,
    result_key TEXT NOT NULL,
    points INTEGER,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (profile_id, market_id)
);

-- Table: leagues
CREATE TABLE league (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    owner_profile_id TEXT NOT NULL,
    profile_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert global league
INSERT INTO league (
    name,
    password,
    owner_profile_id,
    profile_ids
) VALUES (
    'Global',
    '',
    '',
    ARRAY[]::text[]
);