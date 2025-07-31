'use client';
import Loading from "@/components/Loading";
import { useAccount } from "@/hooks/Account";
import { MapAPITeamResponse, Team } from "@/types/Team";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MiniTeamHeader from "../MiniTeamHeader";

export default function AccountPage() {
    const { user, loading, error } = useAccount();
    const [teamId, setTeamId] = useState<string>('');
    const [team, setTeam] = useState<Team | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [auth, setAuth] = useState<boolean>(false);
    const [stadium, setStadium] = useState<string>('');
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStadium = async () => {
            const res = await fetch(`/nextapi/db/generate-ballpark`);
            const data = await res.json();
            if (data.error) {
                setIsAuthenticated(true);
                const teamRes = await fetch(`/nextapi/team/${data.team_id}`);
                const teamData: Team = MapAPITeamResponse(await teamRes.json());
                setTeam(teamData);
                return;
            }
            setStadium(data.stadium_name);
            setIsAuthenticated(false);
        };
        fetchStadium();
    }, []);

    const checkStadium = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await fetch('/nextapi/db/check-ballpark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId }),
        });

        const data = await res.json();
        if (res.ok && data.success === true) {
            setIsAuthenticated(true);
            setAuthError(null);
            const teamRes = await fetch(`/nextapi/team/${teamId}`);
            const teamData: Team = MapAPITeamResponse(await teamRes.json());
            setTeam(teamData);
        } else {
            setAuthError(data.error || 'Authentication failed');
        }
    };

    const router = useRouter();

    if (error){
        router.push('/auth');
    }

    if (loading || isAuthenticated === null) return <Loading />

    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                <div className="flex flex-col items-center min-h-screen w-full">
                    <h1 className="text-2xl font-bold text-center mb-2">This does nothing yet.</h1>
                    <h1>But you are logged in as {user?.username}! {error}</h1>
                    {!isAuthenticated && (<button className="px-3 py-1 text-l bg-theme-primary hover:opacity-80" onClick={() => setAuth((prev) => !prev)}>Link to MMOLB</button>)}
                    {auth && !isAuthenticated ? <>
                        <div className="w-full max-w-md bg-theme-primary rounded-xl shadow-xl p-6 mt-4">
                            <h2 className="text-center text-2xl font-bold mb-6">
                                Link to MMOLB
                            </h2>
                            <h4>Please set your ballpark name to <span className="font-bold mb-1">{stadium}</span></h4>
                            <form onSubmit={checkStadium}>
                                <input placeholder="TeamID" className="w-full p-2 rounded bg-theme-background focus:outline-none my-2" required type="text" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
                                <button className="px-3 py-1 text-l bg-theme-secondary hover:opacity-80">
                                    Check Ballpark
                                </button>
                            </form>
                            {authError}
                        </div>
                    </> : null}
                    {isAuthenticated && team ? <>
                        Your team is:
                        <MiniTeamHeader team={team} />
                    </> : null}
                </div>
            </div>
        </main>
    );
}