export interface Event {
    SeasonId: string,
    Trimester: string | null,
    EventId: string,
    StartDate: string,
    EndDate: string,
    FirstCompetitionDate: string,
    Description: string,
    EventSeriesNr: string,
    ShortDescription: string,
    Altitude: string,
    OrganizerId: string,
    Organizer: string,
    Nat: string,
    NatLong: string,
    MedalSetId: string,
    EventClassificationId: string,
    Level: number,
    UTCOffset: number,
    IsActual: boolean,
    IsCurrent: boolean,
    EventStatusId: number,
    EventStatus: string,
    Notes: string | null
}

export interface Competition {
    RaceId: string,
    km: string,
    catId: string,
    DisciplineId: string,
    StatusId: number,
    StatusText: string,
    ScheduleStatus: string,
    ResultStatus: string,
    HasLiveData: boolean,
    IsLive: boolean,
    StartTime: string,
    Description: string,
    ShortDescription: string,
    Location: string,
    ResultsCredit: null,
    TimingCredit: null,
    HasAnalysis: boolean,
    StartMode: string,
    NrShootings: number,
    NrSpareRounds: number,
    HasSpareRounds: boolean,
    PenaltySeconds: number,
    NrLegs: number,
    ShootingPositions: string,
    LocalUTCOffset: number,
    RSC: string,
    GenderOrder: string,
}

export interface Result {
    StartOrder: number,
    ResultOrder: number,
    IRM: null,
    IBUId: string,
    IsTeam: boolean,
    Name: string,
    ShortName: string,
    FamilyName: string,
    GivenName: string,
    Nat: string,
    Bib: string,
    Leg: number | null,
    Rank: string,
    Shootings: string,
    ShootingTotal: string | null,
    RunTime: null,
    TotalTime: string,
    WC: string | null,
    NC: string | null,
    NOC: null,
    StartTime: string,
    StartInfo: string,
    StartRow: number,
    StartLane: number,
    BibColor: string | null,
    Behind: string,
    StartGroup: null,
    TeamId: null,
    PursuitStartDistance: number,
    Result: string,
    LegRank: null,
    TeamRankAfterLeg: string | null,
    StartConfirmed: null
}

export interface ResultResponse {
    RaceId: string,
    isStartList: boolean,
    isResult: boolean,
    Competition: Competition,
    SportEvt: Event,
    Results: Result[]
}

export interface CompetitorResponse {
    IBUId: string;
    FullName: string;
    FamilyName: string;
    GivenName: string;
    otherFamilyNames: string | null;
    otherGivenNames: string | null;
    NAT: string;
    NF: string;
    Birthdate: string;
    BirthYear: number;
    Age: number;
    GenderId: string;
    Functions: string;
    PhotoURI: string;
    FlagURI: string;
    Bibs: null;
    Personal: PersonalInfo[];
    Sport: SportInfo[];
    Equipment: EquipmentInfo[];
    Stats: StatInfo[];
    Stories: any[];
    Recent: RecentResult[];
    OWG: any[];
    WCH: ChampionshipResult[];
    JWCH: ChampionshipResult[];
    WC: CompetitionResult[];
    IC: CompetitionResult[];
    JC: CompetitionResult[];
    Podiums: PodiumResults;
    CompetitionRankings: null;
    IBUCupScores: null;
    TopResults: TopResult[];
    StatSeasons: string[];
    StatShooting: string[];
    StatShootingProne: string[];
    StatShootingStanding: string[];
    StatSkiing: string[];
    StatSkiKMB: string[];
    StatStarts: null;
    StatLevel: null;
    RNKS: RankingSummary[];
    Badges: any[];
}

interface PersonalInfo {
    Id: string | null;
    Description: string;
    Value: string;
}

interface SportInfo {
    Id: string | null;
    Description: string;
    Value: string;
}

interface EquipmentInfo {
    Id: string;
    Description: string;
    Value: string;
}

interface StatInfo {
    Id: string | null;
    Description: string;
    Value: string;
}

interface RecentResult {
    RaceId: string;
    SeasonId: string;
    Season: string;
    Comp: string;
    Competition: string;
    Level: string;
    Place: string;
    PlaceNat: string;
    Rank: string;
    SO: number;
    Pen: string | null;
    Shootings: string | null;
}

interface ChampionshipResult {
    Year: string;
    SeasonId: string;
    Place: string;
    Ind: string;
    Spr: string;
    Pur: string;
    Mas: string | null;
    Rel: string | null;
    MxRel: string | null;
    SxRel: string | null;
    Tot_Id: string | null;
    Ind_Id: string;
    Spr_Id: string;
    Pur_Id: string;
    Mas_Id: string | null;
    Rel_Id: string | null;
    MxRel_Id: string | null;
    SxRel_Id: string | null;
    Tot: string | null;
    Tot_Score: string | null;
}

interface CompetitionResult {
    Year: string;
    SeasonId: string;
    Place: string | null;
    Ind: string | null;
    Spr: string;
    Pur: string | null;
    Mas: string | null;
    Rel: string | null;
    MxRel: string | null;
    SxRel: string | null;
    Tot_Id: string;
    Ind_Id: string | null;
    Spr_Id: string;
    Pur_Id: string | null;
    Mas_Id: string | null;
    Rel_Id: string | null;
    MxRel_Id: string | null;
    SxRel_Id: string | null;
    Tot: string;
    Tot_Score: string | null;
}

interface PodiumResults {
    [key: string]: number | null;
}

interface TopResult {
    RaceId: string;
    SeasonId: string | null;
    Season: string;
    Comp: string;
    Competition: string;
    Level: string;
    Place: string;
    PlaceNat: string;
    Rank: string;
    SO: number;
    Pen: string;
    Shootings: string;
}

interface RankingSummary {
    Description: string;
    Individual: number | null;
    Sprint: number | null;
    Pursuit: number | null;
    MassStart: number | null;
    IndividualTotal: number | null;
    Team: number | null;
    Relay: number | null;
    MxRelay: number | null;
    SingleMxRelay: number | null;
    Total: number;
    Total_WC: number | null;
    Total_WCH: number | null;
    Total_OWG: number | null;
    All_WC: number | null;
    All_WCH: number | null;
    All_OWG: number | null;
}