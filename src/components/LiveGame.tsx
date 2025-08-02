'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { GameStateDisplay } from '@/components/GameStateDisplay';
import { EventBlock } from './EventBlock';
import { CopiedPopup } from './CopiedPopup';
import PlayerStats from './PlayerStats';
import { useSettings } from './Settings';
import { Baserunner, ProcessMessage } from './BaseParser';
import { Bases } from '@/types/Bases';
import { MapAPITeamResponse } from '@/types/Team';
import { MapAPIGameResponse } from '@/types/Game';
import { Event } from '@/types/Event';
import { GameStats } from '@/types/GameStats';
import { BoxScore } from './BoxScore';
import { ExpandedScoreboard } from './ExpandedScoreboard';
import { usePolling } from '@/hooks/Poll';
import { Player } from '@/types/Player';
import ExpandedPlayerStats from './ExpandedPlayerStats';
import { LiveGameTiny } from './LiveGameTiny';
import { GameHeader } from './GameHeader';

type EventBlockGroup = {
    emoji?: string;
    title?: string;
    color?: string;
    titleColor?: string;
    messages: Event[];
    onClick?: any;
    isWeatherEvent?: boolean;
    isScore?: boolean;
    isEjection?: boolean;
    inning?: string;
};

type LiveGameProps = { 
    awayTeamArg: any;
    homeTeamArg: any; 
    initialDataArg: any; 
    gameId: string;
    playerObjects: Player[];
 };

function getOPS(stats: any): string {
    const singles = stats.singles ?? 0;
    const doubles = stats.doubles ?? 0;
    const triples = stats.triples ?? 0;
    const home_runs = stats.home_runs ?? 0;
    const walked = stats.walked ?? 0;
    const hbp = stats.hit_by_pitch ?? 0;
    const sac_flies = stats.sacrifice_flies ?? 0;
    const at_bats = stats.at_bats ?? 0;
    const hits = (stats.singles ?? 0) + (stats.doubles ?? 0) + (stats.triples ?? 0) + (stats.home_runs ?? 0)
    const obp = ((hits + walked + hbp) / (at_bats + walked + hbp + sac_flies)).toFixed(3);
    const slg = ((singles + 2 * doubles + 3 * triples + 4 * home_runs)/(at_bats)).toFixed(3);
    return (Number(obp) + Number(slg)).toFixed(3);
}

export default function LiveGame({ awayTeamArg, homeTeamArg, initialDataArg, gameId, playerObjects }: LiveGameProps) {
    const awayTeam = MapAPITeamResponse(awayTeamArg);
    const homeTeam = MapAPITeamResponse(homeTeamArg);
    const initialData = MapAPIGameResponse(initialDataArg);
    const [eventLog, setEventLog] = useState<Event[]>(initialData.event_log);
    const [lastEvent, setLastEvent] = useState(initialData.event_log[initialData.event_log.length - 1]);
    const [data, setData] = useState(initialData);
    const [isComplete, setIsComplete] = useState(data.state == 'Complete');
    const [showDetailedStats, setShowDetailedStats] = useState(false);
    const players: Record<string, any> = {};
    const homePlayers: string[] = [];
    const awayPlayers: string[] = [];
    const { settings } = useSettings();

    for (const player of awayTeam.players) {
        const fullName = `${player.first_name} ${player.last_name}`
        players[fullName] = player;
        awayPlayers.push(fullName);
    }

    for (const player of homeTeam.players) {
        const fullName = `${player.first_name} ${player.last_name}`
        players[fullName] = player;
        homePlayers.push(fullName);
    }
    
    const lastEventIndexRef = useRef(lastEvent.index);
    const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>();
    const [playerType, setPlayerType] = useState<'pitching' | 'batting' | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [followLive, setFollowLive] = useState(false);
    const [showBoxScore, setShowBoxScore] = useState(isComplete);

    useEffect(() => {
        lastEventIndexRef.current = lastEvent.index;
    }, [lastEvent]);

    const pollFn = useCallback(async () => {
        const after = eventLog.length > 0 ? eventLog[eventLog.length - 1].index  + 1: 0;
        const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}`);
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
    }, [gameId, eventLog]);

    const killCon = useCallback(() => {
        if (!eventLog || eventLog.length === 0) return false;
        return eventLog[eventLog.length - 1].event === 'Recordkeeping';
    }, [eventLog]);

    usePolling({
        interval: 6000,
        pollFn,
        onData: (newData) => {
            if (newData.entries?.length) {
                setEventLog(prev => ([...prev, ...newData.entries]));
                const lastEvent = newData.entries[newData.entries.length - 1];
                setLastEvent(lastEvent);
                if (lastEvent.event === 'Recordkeeping') {
                    setIsComplete(true);
                    setShowBoxScore(true);
                }
            }
        },
        killCon
    });

    function getBlockMetadata(message: string): { emoji?: string; title?: string, titleColor?: string, inning?: string, onClick?: () => void } | null {
        if (message.includes('Now batting')) {
            const match = message.match(/Now batting: (.+)/);
            const player = match ? match[1].split("(")[0].trim() : null;
            let emoji = null;
            if (player) {
                emoji = awayPlayers.includes(player) ? data.away_team_emoji : data.home_team_emoji;
                emoji = (data.away_team_emoji === data.home_team_emoji) ? awayPlayers.includes(player) ? emoji + "✈️" : emoji + "🏠" : emoji;
            }
            return player && emoji ? { emoji: emoji, titleColor: settings.gamePage?.useTeamColoredHeaders ? awayPlayers.includes(player) ? data.away_team_color : data.home_team_color : undefined, title: player, onClick: () => {setSelectedPlayer(player); setShowStats(true);} } : null;
        }

        if (message.includes('"')) return { emoji: '🤖', title: 'ROBO-UMP' };
        if (message.includes('mound visit') || message.includes('making a pitching change')) return { emoji: '🚶', title: 'Mound Visit' };
        if (message.includes('7.') && message.includes(awayPlayers[0])) return { emoji: awayTeam.emoji, title: 'Away Lineup', titleColor: settings.useTeamColoredHeaders ? data.away_team_color : undefined };
        if (message.includes('7.') && message.includes(homePlayers[0])) return { emoji: homeTeam.emoji, title: 'Home Lineup', titleColor: settings.useTeamColoredHeaders ? data.home_team_color : undefined};
        if (message.includes('End of the ') || message.includes('@') || message.includes('Start of the top of the 1st') || message.includes('Final score:')) return { emoji: 'ℹ️', title: 'Game Info' };

        return null;
    }

    function getEventMessageObject(event: Event): Event {
        if ((event.message.includes("homers") || event.message.includes("grand slam")) && !event.message.includes(`<strong>${event.batter} scores!`) && settings.gamePage?.modifyEvents) event.message += ` <strong>${event.batter} scores!</strong>`;
        if ((event.message.includes("scores") || event.message.includes("steals home"))&& !event.message.includes('Score is now ') && settings.gamePage?.modifyEvents) event.message += `<strong> Score is now ${event.away_score}-${event.home_score}</strong>`

        return {...event};
    }

    function groupEventLog(eventLog: Event[]): EventBlockGroup[] {
        const blocks: EventBlockGroup[] = [];
        let currentBlock: EventBlockGroup | null = null;

        eventLog.forEach((event) => {
            const meta = getBlockMetadata(event.message);
            const eventMessage = getEventMessageObject(event);

            const { isWeatherEvent, isScore, isEjection } = getSpecialEventType(event);
            const inning = event.inning && (meta?.title != 'Game Info' && meta?.title != 'ROBO-UMP') ? (event.inning_side === 0 ? '▲ ' : '▼ ') + event.inning : undefined;

            if (meta) {
                currentBlock = {
                    ...meta,
                    messages: [eventMessage],
                    isWeatherEvent: isWeatherEvent,
                    isScore,
                    isEjection,
                    inning,
                };
                blocks.unshift(currentBlock); // New block on top
            } else if (currentBlock) {
                // Set flags on the block if not already set
                currentBlock.isWeatherEvent ||= isWeatherEvent;
                currentBlock.isScore ||= isScore;
                currentBlock.isEjection ||= isEjection;

                currentBlock.messages.unshift(eventMessage);
            } else {
                currentBlock = {
                    messages: [eventMessage],
                    isWeatherEvent: isWeatherEvent,
                    isScore,
                    isEjection,
                    inning,
                };
                blocks.unshift(currentBlock);
            }
        });

        // Post-process to assign gradient class
        for (const block of blocks) {
            block.color = getSpecialEventColor({isWeatherEvent: block.isWeatherEvent, isScore: block.isScore, isEjection: block.isEjection});
        }

        return blocks;
    }


    const groupedEvents = groupEventLog(eventLog);
    let currentQueue: Baserunner[] = [];
    let lastBases: Bases = { first: null, second: null, third: null }; 

    const gameStats = GameStats();
    for (const event of eventLog) {
        const result = ProcessMessage(event, [...awayPlayers, ...homePlayers], currentQueue, gameStats);
        currentQueue = result.baseQueue;
        lastBases = result.bases;
    }

    return (
        <>
        <main className="mt-8">
        <CopiedPopup />
        <div className={`min-h-screen bg-theme-background text-theme-text font-sans p-4 max-w-3xl mx-auto h-full ${settings.gamePage?.showAwayScoreboard ? '' : 'mt-20'}`}>
            <button onClick={() => window.location.href = `/live/${gameId}`} className="px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md mb-1">
                View in Live Viewer (BETA)
            </button>
            <GameHeader awayTeam={awayTeam} event={lastEvent} homeTeam={homeTeam} game={data} />

            {settings.gamePage?.showExpandedScoreboard && <ExpandedScoreboard
                gameStats={gameStats}
                lastEvent={lastEvent}
                awayTeam={awayTeam}
                homeTeam={homeTeam}
            />}

            {!isComplete && <GameStateDisplay
                event={lastEvent}
                bases={{first: (lastBases.first && lastBases.first !== 'Unknown') ? lastBases.first + ` (${getOPS(players[lastBases.first].stats)} OPS)` : lastBases.first, second: (lastBases.second && lastBases.second !== 'Unknown') ? lastBases.second + ` (${getOPS(players[lastBases.second].stats)} OPS)` : lastBases.second, third: (lastBases.third && lastBases.third !== 'Unknown') ? lastBases.third + ` (${getOPS(players[lastBases.third].stats)} OPS)` : lastBases.third}}
                pitcher={{
                    player: lastEvent.pitcher ? players[lastEvent.pitcher] : null,
                    onClick: () => {setSelectedPlayer(lastEvent.pitcher); setPlayerType('pitching'); setShowStats(true);},
                }}
                batter={{
                    player: lastEvent.batter ? players[lastEvent.batter] : null,
                    onClick: () => {setSelectedPlayer(lastEvent.batter); setPlayerType('batting'); setShowStats(true);},
                }}
                onDeck={{
                    player: lastEvent.on_deck ? players[lastEvent.on_deck] : null,
                    onClick: () => {setSelectedPlayer(lastEvent.on_deck); setPlayerType('batting'); setShowStats(true);},
                }}
                showBases={true}
                playerObjects={playerObjects}
            />}

            <>
            <div className="flex justify-between items-center mb-2 gap-2 mt-4">
                <button onClick={() => setShowBoxScore(!showBoxScore)} className="px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                    {showBoxScore ? 'Hide Box Score' : 'Show Box Score'}
                </button>
                <button onClick={() => setShowStats(!showStats)} className="px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                    {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
                <button onClick={() => setShowDetailedStats(!showDetailedStats)} className="px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                    {showDetailedStats  ? 'Hide Detailed Stats' : 'Show Detailed Stats'}
                </button>
                <button onClick={() => setFollowLive(prev => !prev)} className="px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                    {followLive ? 'Unfollow Live' : 'Follow Live'}
                </button>
            </div>

            {showBoxScore &&
                <div className='flex items-stretch my-2 gap-4'>
                    <div className='flex-1'>
                        <BoxScore gameStats={gameStats} team={awayTeam} isAway={true} />
                    </div>
                    <div className='flex-1'>
                        <BoxScore gameStats={gameStats} team={homeTeam} isAway={false} />
                    </div>
                </div>
            }
            {(showStats && followLive && showDetailedStats) ? (<div className='grid grid-cols-2 gap-2 items-stretch h-full'>
                <ExpandedPlayerStats player={(lastEvent.pitcher && playerObjects.find((p: Player) => `${p.first_name} ${p.last_name}` === lastEvent.pitcher)) ? {...players[lastEvent.pitcher], ...playerObjects.find((p: Player) => `${p.first_name} ${p.last_name}` === lastEvent.pitcher)} : null} category='pitching' />
                <ExpandedPlayerStats player={(lastEvent.batter && playerObjects.find((p: Player) => `${p.first_name} ${p.last_name}` === lastEvent.batter)) ? {...players[lastEvent.batter], ...playerObjects.find((p: Player) => `${p.first_name} ${p.last_name}` === lastEvent.batter)} : null} category='batting' />
                </div>) : ''}
            {(showStats && followLive && !showDetailedStats) ? (<div className='grid grid-cols-2 gap-2 items-stretch h-full'>
                <PlayerStats player={lastEvent.pitcher ? players[lastEvent.pitcher] : null} category='pitching' />
                <PlayerStats player={lastEvent.batter ? players[lastEvent.batter] : null} category='batting' />
                </div>) : ''}
            {(showStats && !followLive && !showDetailedStats) ? (<PlayerStats player={selectedPlayer ? players[selectedPlayer] : null} category={playerType} />) : ''}
            {(showStats && !followLive && showDetailedStats) ? (<ExpandedPlayerStats player={(selectedPlayer && playerObjects.find((p: Player) => `${p.first_name} ${p.last_name}` === selectedPlayer)) ? {...players[selectedPlayer], ...playerObjects.find((p: Player) => `${p.first_name} ${p.last_name}` === selectedPlayer)} : null} category={playerType} />) : ''}
            </>

            <div className="mt-6 space-y-4">
                {groupedEvents.map((block, idx) => (
                    <EventBlock key={idx} emoji={block.emoji} title={block.title} color={block.color} titleColor={block.titleColor} messages={block.messages} onClick={block.onClick ? block.onClick : undefined} inning={block.inning}/>
                ))}
            </div>

        </div>
        </main>
        </>
    );
}

export type SpecialEventType = {
    isWeatherEvent?: boolean;
    isScore?: boolean;
    isEjection?: boolean;
}

export function getSpecialEventType(event: Event): SpecialEventType {
    const isWeatherEvent = /falling star|geomagnetic storms intensify/i.test(event.message);
    const isScore = /scores!|homers on a|grand slam|steals home/i.test(event.message);
    const isEjection = /ROBO-UMP ejected/i.test(event.message);
    return { isWeatherEvent, isScore, isEjection };
}

export function getSpecialEventColor({ isWeatherEvent, isScore, isEjection }: SpecialEventType): string {
    if (isEjection && isScore) {
        return 'linear-gradient(to right bottom, var(--theme-score), var(--theme-ejection))';
    } else if (isWeatherEvent && isScore) {
        return 'linear-gradient(to right bottom, var(--theme-score), var(--theme-weather_event))';
    } else if (isWeatherEvent && isEjection) {
        return 'linear-gradient(to right bottom, var(--theme-weather_event), var(--theme-ejection))';
    } else if (isEjection) {
        return 'var(--theme-ejection)';
    } else if (isWeatherEvent) {
        return 'var(--theme-weather_event)';
    } else if (isScore) {
        return 'var(--theme-score)';
    }
    return '';
}