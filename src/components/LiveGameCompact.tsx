'use client'

import { useState } from 'react';
import { GameStateDisplay } from '@/components/GameStateDisplay';
import LastUpdatedCounter from './LastUpdatedCounter';
import { GameHeader, GameHeaderEvent } from './GameHeader';
import { Team } from '@/types/Team';
import { Game } from '@/types/Game';
import { Event } from '@/types/Event';
import { usePolling } from '@/hooks/Poll';

export function LiveGameCompact({ gameId, homeTeam, awayTeam, game, killLinks = false }: { gameId: string, homeTeam: Team, awayTeam: Team, game: Game , killLinks?: boolean}){
    const [event, setEvent] = useState<Event | null>(null);
    const [hasError, setHasError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

    usePolling({
        interval: 6000,
        pollFn: async () => {
            const after = (event ? event.index + 1 : 0).toString();
            const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}`);
            if (!res.ok) throw new Error("Failed to fetch events")
            return res.json();
        },
        onData: (newData) => {
            if (newData.entries?.length) {
                setEvent(newData.entries[newData.entries.length - 1]);
                setLastUpdated(Date.now());
            }
        },
        killCon: () => {
            return event?.event === 'Recordkeeping';
        }
    });

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