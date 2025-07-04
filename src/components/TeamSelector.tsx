'use client';
import { useEffect, useState } from 'react';
import MiniTeamHeader from './MiniTeamHeader';
import { subscribeToTeam, isSubscribed, registerAndSubscribe, notificationUnsupported, unsubscribeFromTeam } from '@/components/Push'; // your push utils
import { MapAPITeamResponse, Team } from '@/types/Team';

export default function TeamSelector() {
    const [input, setInput] = useState('');
    const [teamIDs, setTeamIDs] = useState<string[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [notificationsAllowed, setNotificationsAllowed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [subscribedTeams, setSubscribedTeams] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const stored = localStorage.getItem('favoriteTeamIDs');
        if (stored) {
            const ids: string[] = JSON.parse(stored);
            setTeamIDs(ids);

            Promise.all(ids.map(id => fetch(`/nextapi/team/${id}`).then(res => (res.ok ? res.json() : null)))).then(results => {
                const validTeams = results.filter((team): team is NonNullable<typeof team> => team !== null).map(MapAPITeamResponse);
                setTeams(validTeams);
            });
        }

        if (!notificationUnsupported() && Notification.permission === 'granted') {
            registerAndSubscribe(setSubscription);
            setNotificationsAllowed(true);
        }
    }, []);

    useEffect(() => {
        if (subscription && teamIDs.length > 0) {
            Promise.all(teamIDs.map(async id => {
                const subscribed = await isSubscribed(id);
                return { id, subscribed };
            })).then(results => {
                const map: Record<string, boolean> = {};
                results.forEach(({ id, subscribed }) => {
                    map[id] = subscribed;
                });
                setSubscribedTeams(map);
            });
        }
    }, [subscription, teamIDs]);

    const allowNotifications = async () => {
        await registerAndSubscribe(setSubscription);
        setNotificationsAllowed(true);
    };

    const toggleTeamSubscription = async (teamId: string) => {
        if (!subscription) {
            alert('Please allow notifications first.');
            return;
        }
        if (subscribedTeams[teamId]) {
            await unsubscribeFromTeam(teamId);
            setSubscribedTeams(prev => ({ ...prev, [teamId]: false }));
        } else {
            await subscribeToTeam(teamId);
            setSubscribedTeams(prev => ({ ...prev, [teamId]: true }));
        }
    };

    const addTeamID = async () => {
        const trimmed = input.trim();
        if (!trimmed || teamIDs.includes(trimmed)) return;

        try {
            const res = await fetch(`/nextapi/team/${trimmed}`);
            if (!res.ok) {
                alert('Invalid team ID.');
                return;
            }
            const teamData = MapAPITeamResponse(await res.json());
            const updatedIDs = [...teamIDs, trimmed];
            const updatedTeams = [...teams, teamData];
            setTeamIDs(updatedIDs);
            setTeams(updatedTeams);
            localStorage.setItem('favoriteTeamIDs', JSON.stringify(updatedIDs));
            setInput('');
        } catch (error) {
            alert('Could not validate team. Please try again later.');
        }
    };

    const removeTeamID = (id: string) => {
        const updatedIDs = teamIDs.filter(t => t !== id);
        const updatedTeams = teams.filter(team => team.id !== id);
        setTeamIDs(updatedIDs);
        setTeams(updatedTeams);
        localStorage.setItem('favoriteTeamIDs', JSON.stringify(updatedIDs));

        setSubscribedTeams(prev => {
            const newMap = { ...prev };
            delete newMap[id];
            return newMap;
        });
    };

    return (
        <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-2 text-theme-text">⭐ Favorite Teams</h1>

        {!notificationsAllowed && !notificationUnsupported() && (
            <button onClick={allowNotifications} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                Click here to allow notifications
            </button>
        )}

        <input type="text" placeholder="Enter Team ID" value={input} onChange={e => setInput(e.target.value)} className="w-full p-2 border rounded mb-2 text-theme-secondary opacity-80"/>
        <button onClick={addTeamID} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
            Add Team
        </button>

        <ul className="space-y-2">
            {teams.map(team => (
                <li key={team.id} className="p-2">
                    <MiniTeamHeader team={team} />
                    <div className='flex justify-between items-center mt-2'>
                        <button onClick={() => removeTeamID(team.id)} className="text-red-500 hover:underline text-sm">Remove</button>
                        {notificationsAllowed && (
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" checked={!!subscribedTeams[team.id]} onChange={() => toggleTeamSubscription(team.id)}/>
                                <span className="text-sm">Notify</span>
                            </label>
                        )}
                    </div>
                </li>
            ))}
        </ul>
        </div>
    );
}
