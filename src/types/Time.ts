type PhaseTimes = {
    electionStart: Date;
    holidayStart: Date;
    homeRunChallenge: Date;
    openingDay: Date;
    postseasonPreview: Date;
    postseasonRound1: Date;
    postseasonRound2: Date;
    postseasonRound3: Date;
    preseason: Date;
    regularSeasonResume: Date;
    superstarBreakStart: Date;
    superstarGame: Date;
}

export type Time = {
    phaseTimes: PhaseTimes;
    seasonDay: number;
    seasonNumber: number;
    seasonStatus: string;
}

export async function fetchTime(): Promise<Time> {
    const res = await fetch(`/nextapi/time`);
    if (!res.ok) throw new Error('Failed to load time');
    const data = await res.json();
    return {
        seasonDay: data.season_day,
        seasonNumber: data.season_number,
        seasonStatus: data.season_status,
        phaseTimes: {
            electionStart: data.phase_timesElectionStart,
            holidayStart: data.phase_timesHolidayStart,
            homeRunChallenge: data.phase_timesHomeRunChallenge,
            openingDay: data.phase_timesOpeningDay,
            postseasonPreview: data.phase_timesPostseasonPreview,
            postseasonRound1: data.phase_timesPostseasonRound1,
            postseasonRound2: data.phase_timesPostseasonRound2,
            postseasonRound3: data.phase_timesPostseasonRound3,
            preseason: data.phase_timesPreseason,
            regularSeasonResume: data.phase_timesRegularSeasonResume,
            superstarBreakStart: data.phase_timesSuperstarBreakStart,
            superstarGame: data.phase_timesSuperstarGame,
        },
    };
}
