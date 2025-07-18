import {MarketType} from '@/app/api/features/market-type/market-types';

export interface DbProfile {
    id: string;
    name: string;
    email: string;
    image: string;
    customer_id: string;
    price_id: string;
    has_access: boolean;
    is_admin: boolean;
    username: string;
    country: string;
    favorite_athlete: string;
    created_at: string;
    updated_at: string;
}

// ---------------------
export interface DbCategory extends TimeStamps {
    id: number;
    name: string; // Östersund
    location: string;
    biathlon_event_id: string | null;
    start_time: string;
    is_active: boolean;
}

export interface Category extends DbCategory {
    matches: Match[]
}

export type Gender = 'M' | 'W' | 'X'
export interface DbMatch extends TimeStamps {
    id: number;
    category_id: number;
    name: string; // SINGLE MIXED
    biathlon_race_id: string | null;
    gender: Gender;
    is_team: boolean;
    start_time: string;
}

export interface Match extends DbMatch {
    markets: Market[]
}

export type OptionsToChooseFromForUser = 'Team' | 'Competitor' | 'PositiveNumber' | 'Number' | 'NumberRange15' | 'ThreeWay';
export const optionsToChooseFromForUser: OptionsToChooseFromForUser[] = [
	'Team',
	'Competitor',
	'PositiveNumber',
	'Number',
	'NumberRange15',
	'ThreeWay'
];
//mis on dropdownis kasutajale
//  1. individuaal (M/N filter)
//  2. riigid
//  3. numbrid
//  4. numbri range

// mis on dropdownis market types
//  1. tiimi omad
//  2. individuaali omad

export interface DbMarket extends TimeStamps {
    id: number;
    match_id: number;
    market_type_id: number;
    name: string; // Vähim trahve
    options_to_choose_from_for_user: OptionsToChooseFromForUser;
    result: string | null; // Must match selection result key
}

export interface Market extends DbMarket{
    market_type: MarketType;
}

export interface DbSelection extends TimeStamps {
    profile_id: string;
    market_id: number;
    result_key: string;
    points: number | null;
    type: OptionsToChooseFromForUser;
}

export interface DbCompetitor extends TimeStamps {
    name: string;
    ibu_id: string;
    gender: Gender;
    is_team: boolean;
    extra_data: any;
}

export interface DbLeague extends TimeStamps {
    id: number;
    name: string;
    password: string;
    profile_ids: string[];
    owner_profile_id: string;
}

export interface TimeStamps {
    updated_at: string;
    created_at: string;
}