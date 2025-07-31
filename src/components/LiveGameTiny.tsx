'use client'
import { useCallback, useState } from 'react';
import { Team } from '@/types/Team';
import { Game } from '@/types/Game';
import { Event } from '@/types/Event';
import { usePolling } from '@/hooks/Poll';
import { getContrastTextColor } from '@/helpers/ColorHelper';
import { getSpecialEventColor, getSpecialEventType } from './LiveGame';

type LiveGameTinyProps = {
    gameId: string;
    homeTeam: Team;
    awayTeam: Team;
    game: Game;
    lastEvent: Event;
    killLinks?: boolean;
}

function baseStyles(active: boolean) {
    return `absolute w-2.5 h-2.5 rotate-45 transition-opacity duration-500 ${active ? 'opacity-90 bg-theme-text' : 'opacity-20 bg-theme-text'}`;
}

function renderCircles(count: number, max: number) {
    return Array.from({ length: max }).map((_, i) => (
        <div
            key={i}
            className={`w-2 h-2 rounded-full bg-theme-text ${i < count ? 'opacity-90' : 'opacity-20'}`}
        />
    ));
}

export function LiveGameTiny({ gameId, homeTeam, awayTeam, game, lastEvent, killLinks = false }: LiveGameTinyProps) {
    const [event, setEvent] = useState<Event | null>(lastEvent);
    const [isComplete, setIsComplete] = useState(game.state == 'Complete');

    const pollFn = useCallback(async () => {
        const after = (event ? event.index + 1 : 0).toString();
        const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}`);
        if (!res.ok) throw new Error("Failed to fetch events")
        return res.json();
    }, [gameId, event]);

    const killCon = useCallback(() => {
        return event?.event === 'Recordkeeping';
    }, [event]);

    usePolling({
        interval: 6000,
        pollFn,
        onData: (newData) => {
            if (newData.entries?.length) {
                setEvent(newData.entries[newData.entries.length - 1]);
                if (newData.entries[newData.entries.length - 1].event === 'Recordkeeping')
                    setIsComplete(true);
            }
        },
        killCon
    });

    if (!event) return null;
    const bases = {
        first: event.on_1b,
        second: event.on_2b,
        third: event.on_3b,
    }

    const specialEventColor = getSpecialEventColor(getSpecialEventType(event));

    return (<>
        <div className='w-36 h-16 relative rounded-xl' style={{ background: specialEventColor || 'var(--theme-primary)' }}>
            <div className='grid grid-rows-2 absolute size-full'>
                <div className='row-1 rounded-t-xl' style={{ background: `linear-gradient(120deg, #${awayTeam.color} 55%, #00000000 67%)` }}></div>
                <div className='row-2 rounded-b-xl' style={{ background: `linear-gradient(60deg, #${homeTeam.color} 55%, #00000000 67%)` }}></div>
            </div>
            <div className='flex justify-between absolute items-stretch size-full p-2'>
                <div className='justify-self-start grid grid-rows-2 gap-y-2 text-sm font-semibold'>
                    <div className='row-1 col-1 w-12' style={{color: getContrastTextColor(awayTeam.color) || 'rgb(0,0,0)'}}>
                        <span className='text-xs text-shadow-sm/20'>{awayTeam.emoji}</span> {awayTeam.abbreviation}
                    </div>
                    <div className='row-2 col-1 w-12' style={{color: getContrastTextColor(homeTeam.color) || 'rgb(0,0,0)'}}>
                        <span className='text-xs text-shadow-sm/20'>{homeTeam.emoji}</span> {homeTeam.abbreviation}
                    </div>
                    <div className='row-1 col-2 text-right w-6' style={{color: getContrastTextColor(awayTeam.color) || 'rgb(0,0,0)'}}>
                        {event.away_score}
                    </div>
                    <div className='row-2 col-2 text-right w-6' style={{color: getContrastTextColor(homeTeam.color) || 'rgb(0,0,0)'}}>
                        {event.home_score}
                    </div>
                </div>
                <div className={`flex flex-col justify-center w-10 ${isComplete && 'hidden'}`}>
                    <div className="relative w-6 h-6 mx-auto">
                        <div>
                            <div
                                className={baseStyles(!!bases.second)}
                                style={{
                                    left: 'calc(50% - 3px)',
                                    top: 'calc(20% + 3px)',
                                    transform: 'translate(-50%, -50%) rotate(90deg)',
                                }}
                            />
                        </div>
                        <div>
                            <div
                                className={baseStyles(!!bases.first)}
                                style={{
                                    left: 'calc(90% - 3px)',
                                    top: 'calc(60% + 3px)',
                                    transform: 'translate(-50%, -50%) rotate(90deg)',
                                }}
                            />

                        </div>
                        <div>
                            <div
                                className={baseStyles(!!bases.third)}
                                style={{
                                    left: 'calc(10% - 3px)',
                                    top: 'calc(60% + 3px)',
                                    transform: 'translate(-50%, -50%) rotate(90deg)',
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="flex ml-1 mt-1 justify-center space-x-1">{renderCircles(event.outs, 2)}</div>
                </div>
                <div className='justify-self-end grid grid-rows-3 text-xs text-center font-semibold'>
                    <div className='row-1'>{!isComplete && event.inning_side === 0 && '▲'}</div>
                    <div className='row-2'>{!isComplete ? event.inning : `F${event.inning > 9 && `/${event.inning}`}`}</div>
                    <div className='row-3'>{!isComplete && event.inning_side === 1 && '▼'}</div>
                </div>
            </div>
        </div>
    </>);
}