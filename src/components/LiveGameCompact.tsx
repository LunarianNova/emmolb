'use client'

import { useEffect, useState, useRef } from 'react';
import { GameStateDisplay } from '@/components/GameStateDisplay';
import LastUpdatedCounter from './LastUpdatedCounter';
import { GameHeader, GameHeaderEvent } from './GameHeader';
import { Team } from '@/types/Team';
import { Game } from '@/types/Game';
import { Event } from '@/types/Event';

export function LiveGameCompact({ gameId, homeTeam, awayTeam, game, killLinks = false }: { gameId: string, homeTeam: Team, awayTeam: Team, game: Game , killLinks?: boolean}){
    const [event, setEvent] = useState<any | null>(null);
    const [hasError, setHasError] = useState(false);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

    useEffect(() => {
        async function fetchInitial() {
            try {
                const res = await fetch(`/nextapi/game/${gameId}/live`);
                if (!res.ok) throw new Error("Fetch failed");
                const data = await res.json();

                if (!data?.entries?.length) throw new Error("No event log");

                setEvent(data.entries[data.entries.length - 1]);
                setLastUpdated(Date.now());
            } catch (err) {
                console.error("Error loading game:", err);
                setHasError(true);
            }
        }

        fetchInitial();

        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/nextapi/game/${gameId}/live`);
                if (!res.ok) throw new Error("Polling failed");
                const data = await res.json();
                if (data?.entries?.length) {
                    setEvent(data.entries[data.entries.length - 1]);
                    setLastUpdated(Date.now());
                }
            } catch (err) {
                console.error("Polling error:", err);
                setHasError(true);
            }
        }, 6000);

        return () => {if (pollingRef.current) clearInterval(pollingRef.current);};
    }, [gameId]);

    if (hasError || !event) return <GameHeader homeTeam={homeTeam} awayTeam={awayTeam} game={game} killLinks={killLinks} />;
  
    return (<>
        <GameHeaderEvent homeTeam={homeTeam} awayTeam={awayTeam} game={game} event={event} killLinks={killLinks} />
        <GameStateDisplayCompact event={event} lastUpdated={lastUpdated}/>
    </>);
}

export function GameStateDisplayCompact({ event, lastUpdated }: { event: Event, lastUpdated: any }) {
    const background = (event.message.includes('scores!') || event.message.includes('homers')) ? 'bg-theme-score' : event.message.includes('star') ? 'bg-theme-star' : 'bg-theme-secondary';

    return (
        <div className={`${background} p-4 rounded-lg shadow-lg border border-theme-accent mb-16`}>
            <GameStateDisplay
                event={event}
                bases={{
                    first: event.on_1b ? 'Unknown' : null,
                    second: event.on_2b ? 'Unknown' : null,
                    third: event.on_3b ? 'Unknown' : null,
                }}
                pitcher={{
                    player: event.pitcher ? event.pitcher : '',
                    onClick: () => {},
                }}
                batter={{
                    player: event.batter ? event.batter : '',
                    onClick: () => {},
                }}
                onDeck={{
                    player: event.on_deck ? event.on_deck : '',
                    onClick: () => {},
                }}
            />
            <div className='text-sm p-2' dangerouslySetInnerHTML={{__html: event.message}} />
            <LastUpdatedCounter lastUpdatedTimestamp={lastUpdated}/>
        </div>
    );
    }