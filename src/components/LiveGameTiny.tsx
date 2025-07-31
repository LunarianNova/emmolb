'use client'
import { useCallback, useState } from 'react';
import { Team } from '@/types/Team';
import { Game, MapAPIGameResponse } from '@/types/Game';
import { Event } from '@/types/Event';
import { usePolling } from '@/hooks/Poll';
import { getContrastTextColor } from '@/helpers/ColorHelper';
import { getSpecialEventColor, getSpecialEventType } from './LiveGame';
import { DayGame } from '@/types/DayGame';

type LiveGameTinyProps = {
    dayGame: DayGame;
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

export function LiveGameTiny({ dayGame }: LiveGameTinyProps) {
    const [event, setEvent] = useState<Event | null>();
    const [game, setGame] = useState<Game>();
    const [isComplete, setIsComplete] = useState(dayGame.status === 'Final');

    const pollFn = useCallback(async () => {
        const res = await fetch(event
            ? `/nextapi/game/${dayGame.game_id}/live?after=${event.index + 1}`
            : `/nextapi/gameheader/${dayGame.game_id}`);
        if (!res.ok) throw new Error("Failed to fetch events")
        return res.json();
    }, [dayGame]);

    const killCon = useCallback(() => {
        return event?.event === 'Recordkeeping';
    }, [event]);

    usePolling({
        interval: 6000,
        pollFn,
        onData: (newData) => {
            if (newData.game?.EventLog) {
                const newGame = MapAPIGameResponse(newData.game);
                setGame(newGame);
                setEvent(newGame.event_log[newGame.event_log.length - 1]);
            }
            else if (newData.entries?.length) {
                setEvent(newData.entries[newData.entries.length - 1]);
                if (newData.entries[newData.entries.length - 1].event === 'Recordkeeping')
                    setIsComplete(true);
            }
        },
        killCon
    });

    const bases = event && {
        first: event.on_1b,
        second: event.on_2b,
        third: event.on_3b,
    }

    const specialEventColor = event && getSpecialEventColor(getSpecialEventType(event));

    return (<>
        <div className='w-36 h-16 relative rounded-xl' style={{ background: specialEventColor || 'var(--theme-primary)' }}>
            <div className='grid grid-rows-2 absolute size-full'>
                <div className='row-1 rounded-t-xl' style={{ background: `linear-gradient(120deg, #${dayGame.away_team_color} 55%, #00000000 67%)` }}></div>
                <div className='row-2 rounded-b-xl' style={{ background: `linear-gradient(60deg, #${dayGame.home_team_color} 55%, #00000000 67%)` }}></div>
            </div>
            {event &&
                <div className='flex justify-between absolute items-stretch size-full p-2'>
                    <div className='justify-self-start grid grid-rows-2 gap-y-2 text-sm font-semibold'>
                        <div className='row-1 col-1 w-14' style={{ color: getContrastTextColor(dayGame.away_team_color) || 'rgb(0,0,0)' }}>
                            <span className='text-xs text-shadow-sm/20'>{dayGame.away_team_emoji}</span> {game?.away_team_abbreviation}
                        </div>
                        <div className='row-2 col-1 w-14' style={{ color: getContrastTextColor(dayGame.home_team_color) || 'rgb(0,0,0)' }}>
                            <span className='text-xs text-shadow-sm/20'>{dayGame.home_team_emoji}</span> {game?.home_team_abbreviation}
                        </div>
                        <div className='row-1 col-2 text-right w-4' style={{ color: getContrastTextColor(dayGame.away_team_color) || 'rgb(0,0,0)' }}>
                            {dayGame.away_team_runs}
                        </div>
                        <div className='row-2 col-2 text-right w-4' style={{ color: getContrastTextColor(dayGame.home_team_color) || 'rgb(0,0,0)' }}>
                            {dayGame.home_team_runs}
                        </div>
                    </div>
                    {bases && !isComplete &&
                        <div className='flex flex-col justify-center w-10'>
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
                    }
                    <div className='justify-self-end grid grid-rows-3 text-xs text-center font-semibold'>
                        <div className='row-1'>{!isComplete && event && event.inning_side === 0 && '▲'}</div>
                        <div className='row-2'>{!isComplete && event ? event.inning : `F${(event && event.inning > 9) ? `/${event.inning}` : ''}`}</div>
                        <div className='row-3'>{!isComplete && event && event.inning_side === 1 && '▼'}</div>
                    </div>
                </div>
            }
        </div>
    </>);
}