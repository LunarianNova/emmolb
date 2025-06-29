'use client'

import { useEffect, useState, useRef } from 'react';
import { GameStateDisplay } from '@/components/GameStateDisplay';
import LastUpdatedCounter from './LastUpdatedCounter';
import { GameHeader, GameHeaderFromResponse } from './GameHeader';

export function LiveGameCompact({ gameId, homeTeam, awayTeam, game, killLinks = false }: { gameId: string, homeTeam: any, awayTeam: any, game: any , killLinks?: boolean}){
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

        return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [gameId]);

    if (hasError || !event) return <GameHeaderFromResponse homeTeam={homeTeam} awayTeam={awayTeam} game={game} killLinks={killLinks} />;
  
    return (
        <>
            <GameHeader
            homeTeam={{
                id : homeTeam._id,
                name: game.HomeTeamName,
                emoji: game.HomeTeamEmoji,
                score: event.home_score,
                wins: homeTeam.Record["Regular Season"].Wins,
                losses: homeTeam.Record["Regular Season"].Losses,
                runDiff: homeTeam.Record["Regular Season"].RunDifferential,
                color: game.HomeTeamColor,
            }}
            awayTeam={{
                id: homeTeam._id,
                name: game.AwayTeamName,
                emoji: game.AwayTeamEmoji,
                score: event.away_score,
                wins: awayTeam.Record["Regular Season"].Wins,
                losses: awayTeam.Record["Regular Season"].Losses,
                runDiff: awayTeam.Record["Regular Season"].RunDifferential,
                color: game.AwayTeamColor,
            }}
            center={{
                icon: game.Weather.Emoji,
                title: game.Weather.Name,
                subtitle: game.Weather.Tooltip,
            }}
            inning={game.State != "Complete" ? (event.inning_side === 1 ? `BOT ${event.inning} 🞂` : `🞀 TOP ${event.inning}`) : "FINAL"}
            killLinks={killLinks}
            />
            <GameStateDisplayCompact event={event} lastUpdated={lastUpdated}/>
        </>
    )
}

export function GameStateDisplayCompact({ event, lastUpdated }: { event: any, lastUpdated: any }) {
    const bgClasses = {scored: 'bg-[#1b5e20]', normal: 'bg-[#121a28]',};
    const bgClass = (event.message.includes('scores!') || event.message.includes('homers')) ? bgClasses.scored : bgClasses.normal;


    return (
        <div className={`${bgClass} p-4 rounded-lg shadow-lg border border-[#1e2a36] mb-16`}>
        <GameStateDisplay
            balls={event.balls ?? 0}
            strikes={event.strikes ?? 0}
            outs={event.outs ?? 0}
            bases={{
            first: event.on_1b,
            second: event.on_2b,
            third: event.on_3b,
            }}
            pitcher={{
            name: event.pitcher,
            stat: '',
            onClick: () => {},
            }}
            batter={{
            name: event.batter,
            stat: '',
            onClick: () => {},
            }}
            onDeck={{
            name: event.on_deck,
            stat: '',
            onClick: () => {},
            }}
        />
        <div className='text-sm p-2' dangerouslySetInnerHTML={{__html: event.message}} />
        <LastUpdatedCounter lastUpdatedTimestamp={lastUpdated}/>
        </div>
    );
    }
