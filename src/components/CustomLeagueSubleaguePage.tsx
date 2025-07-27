'use client'
import { useEffect, useState } from "react";
import Loading from "./Loading";
import { MapAPITeamResponse, MapTeamLite, Team } from "@/types/Team";
import MiniTeamHeader from "./MiniTeamHeader";
import CustomLeagueHeader from "./CustomLeagueHeader";

function getCurrentPhase(now: Date, phases: { name: string, start: string }[]): string {
    const preview = phases.find(p => p.name === "PostseasonPreview");
    if (!preview) return "Unknown";
    return now >= new Date(preview.start) ? "Postseason" : "Regular Season";
}

export default function CustomLeagueSubleaguePage({league}: {league: any}){
    const [input, setInput] = useState('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [time, setTime] = useState<any>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        async function getTeams() {
            try {
                if (league.league_teams?.trim()){
                    const res = await fetch(`/nextapi/cashews-teams-lite?ids=${league.league_teams}`);
                    if (!res.ok) throw new Error('Failed to fetch team!');
                    const data = await res.json();
                    const teams: Team[] = data.map((t: any) => MapTeamLite(t));
                    setTeams(teams);
                }

                const timeRes = await fetch(`/nextapi/time`);
                if (!timeRes.ok) throw new Error('Failed to load time');
                setTime(await timeRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        getTeams();
    }, [league.league_teams]);

    const addTeamID = async () => {
        const trimmedId = input.trim();
        if (!trimmedId) return;

        setIsSubmitting(true);

        try {
            const teamRes = await fetch(`/nextapi/team/${trimmedId}`);
            if (!teamRes.ok) throw new Error('Could not fetch new team data.');

            const addRes = await fetch('/nextapi/db/add-team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    league_name: league.league_name,
                    team_id: trimmedId,
                }),
            });

            if (!addRes.ok) {
                const errorData = await addRes.json();
                throw new Error(errorData.message || 'Failed to add team.');
            }
            
            const newTeam = MapAPITeamResponse(await teamRes.json());
            setTeams(prevTeams => [...prevTeams, newTeam]);
            setInput('');

        } catch (err: any) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeTeamID = async (id: string) => {
        setIsSubmitting(true);

        try {
            const removeRes = await fetch('/nextapi/db/remove-team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    league_name: league.league_name,
                    team_id: id,
                }),
            });
            
            if (!removeRes.ok) {
                const errorData = await removeRes.json();
                throw new Error(errorData.message || 'Failed to remove team.');
            }
            
            setTeams(prevTeams => prevTeams.filter(team => team.id !== id));

        } catch (err: any) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !time) return (<Loading />);
    if (!teams.length) return ( 
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                <div className="mb-8">
                    <CustomLeagueHeader league={league} />
                    <button onClick={() => setIsEditing(prev => !prev)} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                        {isEditing ? 'Save Changes' : 'Edit Teams'}
                    </button>
                    {isEditing && (<>
                        <input type="text" placeholder="Enter Team ID" value={input} onChange={e => setInput(e.target.value)} className="w-full p-2 border rounded mb-2 text-theme-secondary opacity-80"/>
                        <button onClick={addTeamID} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                            {isSubmitting ? 'Editing...' : 'Add Team'}
                        </button>
                    </>)}
                </div>
            </div>
        </main>
    );

    teams.sort((a, b) => (b.record.regular_season.wins - b.record.regular_season.losses) - (a.record.regular_season.wins - a.record.regular_season.losses));
    const totalGamesInSeason = 120;
    const gamesPlayed = Math.floor(time.season_day / 2);
    const gamesLeft = totalGamesInSeason-gamesPlayed;
    const topTeamWinDiff = teams[0].record.regular_season.wins - teams[0].record.regular_season.losses;

    const worstCaseTopTeam = time.season_day%2 == 0 ? topTeamWinDiff-gamesLeft+1 : topTeamWinDiff-gamesLeft;
    let cutoffIndex = teams.findIndex(team => (((team.record.regular_season.wins + gamesLeft) - team.record.regular_season.losses) < (worstCaseTopTeam)));
    cutoffIndex = Math.max(1, cutoffIndex);
    
    const phase = getCurrentPhase(new Date(), Object.entries(time.phase_times as Record<string, string>).map(([name, start]) => ({name, start})));
    const isPostseason = phase === 'Postseason';
    const postSeasonGL = `Final Standings for Season ${time.season_number}`

    const isEvenDay = time.season_day % 2 === 0;
    const pluralGamesLeft = gamesLeft !== 1;
    const formattedGL = `${gamesLeft}${isEvenDay ? `-${gamesLeft + 1}` : ''} Game${pluralGamesLeft ? 's' : ''} Remain${pluralGamesLeft ? '' : 's'}`;

    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                <div className="mb-8">
                    <CustomLeagueHeader league={league} />
                    <button onClick={() => setIsEditing(prev => !prev)} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                        {isEditing ? 'Save Changes' : 'Edit Teams'}
                    </button>
                    {isEditing && (<>
                        <input type="text" placeholder="Enter Team ID" value={input} onChange={e => setInput(e.target.value)} className="w-full p-2 border rounded mb-2 text-theme-secondary opacity-80"/>
                        <button onClick={addTeamID} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                            {isSubmitting ? 'Adding...' : 'Add Team'}
                        </button>
                    </>)}
                    <div className="flex justify-center">
                        <div className="w-full max-w-[36rem] space-y-2">
                            <div className="text-center mt-0 mb-4 text-lg font-bold">{isPostseason ? postSeasonGL : formattedGL}</div>
                            <div className='flex justify-end px-2 text-xs font-semibold uppercase'>
                                <div className='ml-1 w-14 text-right'>Record</div>
                                <div className='ml-1 w-9 text-right'>WD</div>
                                <div className='ml-1 w-10 text-right'>RD</div>
                                <div className='ml-1 w-9 text-right'>GB</div>
                            </div>
                            {teams.map((team: any, index) => (
                                <div key={team.id || index}>
                                    {index === cutoffIndex && (
                                        <div className="relative my-4 flex items-center" aria-label="Cutoff line">
                                            <div className="absolute -left-2 sm:left-0 sm:-translate-x-full bg-theme-text text-xs font-bold px-2 py-0.5 rounded-sm select-none text-theme-background whitespace-nowrap">
                                                #1 CUTOFF
                                            </div>
                                            <div className="flex-grow border-t-2 border-theme-text"></div>
                                        </div>
                                    )}
                                    <MiniTeamHeader team={team} leader={teams[0]} index={index + 1} alignValues={true} />
                                    {isEditing && (
                                        <button onClick={() => removeTeamID(team.id)} className="text-red-500 hover:underline text-sm" disabled={isSubmitting}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}