'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { GameHeader } from '@/components/GameHeader';
import { GameStateDisplay } from '@/components/GameStateDisplay';
import { EventBlock } from './EventBlock';
import { CopiedPopup } from './CopiedPopup';

type Event = any; // ahhhh

type EventMessage = {
  index: number;
  message: string;
  pitchSpeed?: string | null;
  pitchZone?: string | null;
}

type EventBlockGroup = {
  emoji?: string;
  title?: string;
  color?: string;
  messages: EventMessage[];
};

function getERA(stats: any): string {
  const earnedRuns = stats.earned_runs ?? 0;
  const outs = stats.outs ?? 0;
  const inningsPitched = outs / 3;

  if (inningsPitched === 0) return "∞ ERA";

  const era = (earnedRuns / inningsPitched) * 9;
  return `${era.toFixed(2)} ERA`;
}

function getBA(stats: any): string {
  const singles = stats.singles ?? 0
  const doubles = stats.doubles ?? 0
  const triples = stats.triples ?? 0
  const home_runs = stats.home_runs ?? 0
  const hits = singles + doubles + triples + home_runs
  const at_bats = stats.at_bats ?? 0
  return at_bats == 0 ? "N/A BA" : `${(hits/at_bats).toFixed(3)} BA`;
}

function formatBatterStats(stats: any) {
  const singles = stats.singles ?? 0;
  const doubles = stats.doubles ?? 0;
  const triples = stats.triples ?? 0;
  const home_runs = stats.home_runs ?? 0;
  const hits = singles + doubles + triples + home_runs;
  const at_bats = stats.at_bats ?? 0;
  const walks = stats.walks ?? 0;
  const hit_by_pitch = stats.hit_by_pitch ?? 0;
  const sacrifice_flies = stats.sacrifice_flies ?? 0;
  const sacrifice_hits = stats.sacrifice_hits ?? 0;
  const stolen_bases = stats.stolen_bases ?? 0;
  const caught_stealing = stats.caught_stealing ?? 0;

  const PA = at_bats + walks + hit_by_pitch + sacrifice_flies + sacrifice_hits;
  const OBP = PA ? ((hits + walks + hit_by_pitch) / (PA - sacrifice_hits)).toFixed(3) : "N/A";
  const SLG = at_bats ? ((singles + 2 * doubles + 3 * triples + 4 * home_runs) / at_bats).toFixed(3) : "N/A";
  const OPS = (parseFloat(OBP) + parseFloat(SLG)).toFixed(3);
  const BA = at_bats ? (hits / at_bats).toFixed(3) : "N/A";
  const SBpct = (stolen_bases + caught_stealing) > 0
    ? `${Math.round((stolen_bases / (stolen_bases + caught_stealing)) * 100)}%`
    : "N/A";

  return {
    "PA": PA,
    "BA": BA,
    "OBP": OBP,
    "SLG": SLG,
    "OPS": OPS,
    "SB%": SBpct,
  };
}

function formatPitcherStats(stats: any) {
  const outs = stats.outs ?? 0;
  const earned_runs = stats.earned_runs ?? 0;
  const walks = stats.walks ?? 0;
  const hits = stats.hits_allowed ?? 0;
  const home_runs = stats.home_runs_allowed ?? 0;
  const strikeouts = stats.strikeouts ?? 0;

  const IP = outs / 3;
  if (IP === 0) return {
    "IP": "0.0",
    "ERA": "∞",
    "WHIP": "∞",
    "H/9": "∞",
    "HR/9": "∞",
    "K/9": "∞",
    "BB/9": "∞",
  };

  return {
    "IP": IP.toFixed(1),
    "ERA": ((earned_runs / IP) * 9).toFixed(2),
    "WHIP": ((walks + hits) / IP).toFixed(2),
    "H/9": ((hits / IP) * 9).toFixed(2),
    "HR/9": ((home_runs / IP) * 9).toFixed(2),
    "K/9": ((strikeouts / IP) * 9).toFixed(2),
    "BB/9": ((walks / IP) * 9).toFixed(2),
  };
}

export default function LiveGame({ awayTeam, homeTeam, initialData, gameId }: { awayTeam: any, homeTeam: any, initialData: any; gameId: string }) {
  const [eventLog, setEventLog] = useState<Event[]>(initialData.EventLog);
  const [lastEvent, setLastEvent] = useState(initialData.EventLog[initialData.EventLog.length - 1]);
  const [data, setData] = useState(initialData);
  const playerStats: Record<string, any> = {};
  const homePlayers: string[] = [];
  const awayPlayers: string[] = [];

  for (const player of awayTeam.Players) {
    const fullName = `${player.FirstName} ${player.LastName}`
    playerStats[fullName] = player.Stats
    awayPlayers.push(fullName);
  }

  for (const player of homeTeam.Players) {
    const fullName = `${player.FirstName} ${player.LastName}`
    playerStats[fullName] = player.Stats
    homePlayers.push(fullName);
  }
  
const lastEventIndexRef = useRef(lastEvent.index);
const failureCountRef = useRef(0);
const repeatedAfterCountRef = useRef(0);
const lastAfterRef = useRef<string | null>(null);
const pollingRef = useRef<NodeJS.Timeout | null>(null);
const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
const [playerType, setPlayerType] = useState<'pitcher' | 'batter' | null>(null);
const [showDerived, setShowDerived] = useState(true);
const [showStats, setShowStats] = useState(false);

useEffect(() => {
  lastEventIndexRef.current = lastEvent.index;
}, [lastEvent]);

useEffect(() => {
  let isMounted = true;

  async function poll() {
    if (!isMounted) return;
    if (data.State === "Complete") {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        console.log("Polling stopped: game complete.");
      }
      return;
    }

    const after = (lastEventIndexRef.current + 1).toString();

    // Track repeated 'after' param requests
    if (lastAfterRef.current === after) {
      repeatedAfterCountRef.current++;
    } else {
      repeatedAfterCountRef.current = 0;
      lastAfterRef.current = after;
    }

    if (repeatedAfterCountRef.current >= 5) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        console.warn("Polling halted: repeated same 'after' param 5 times.");
      }
      return;
    }

    try {
      const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}`);
      if (!res.ok) throw new Error('Failed to fetch live events');

      const newData = await res.json();
      failureCountRef.current = 0;

      if (newData.entries && newData.entries.length > 0) {
        setEventLog(prev => [...prev, ...newData.entries]);
        setLastEvent(newData.entries[newData.entries.length - 1]);
      }

      if (newData.State === "Complete") {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch (error) {
      console.error(error);
      failureCountRef.current++;
      if (failureCountRef.current >= 5) {
        console.warn("Polling halted after repeated failures.");
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    }
  }

  pollingRef.current = setInterval(poll, 6000);

  return () => {
    isMounted = false;
    if (pollingRef.current) clearInterval(pollingRef.current);
  };
}, [gameId]);


function getBlockMetadata(message: string): { emoji?: string; title?: string } | null {
  if (message.includes('Now batting')) {
    const match = message.match(/Now batting: (.+)/);
    const player = match ? match[1].split("(")[0].trim() : null;
    let emoji = null;
    if (player) {
        emoji = awayPlayers.includes(player) ? data.AwayTeamEmoji : data.HomeTeamEmoji;
    }
    return player && emoji ? { emoji: emoji, title: player } : null;
  }

  if (message.includes('"')) return { emoji: '🤖', title: 'ROBO-UMP' };
  if (message.includes('mound visit')) return { emoji: '🚶', title: 'Mound Visit' };
  if (message.includes('7.') && message.includes(awayPlayers[0])) return { emoji: awayTeam.Emoji, title: 'Away Lineup' };
  if (message.includes('7.') && message.includes(homePlayers[0])) return { emoji: homeTeam.Emoji, title: 'Home Lineup' };
  if (message.includes('End') || message.includes('@') || message.includes('Start of the top of the 1st') || message.includes('Final score:')) return { emoji: 'ℹ️', title: 'Game Info' };


  return null; // Other events will be added to the latest group
}

function getEventMessageObject(event: any, index: number): EventMessage {
  const message = event.message;
  const pitchSpeed = event.pitch_info ?? null;
  const pitchZone = event.zone ?? null;

  return {index: index, message: message, pitchSpeed: pitchSpeed, pitchZone: pitchZone};
}

function groupEventLog(eventLog: { message: string }[]): EventBlockGroup[] {
  const blocks: EventBlockGroup[] = [];
  let currentBlock: EventBlockGroup | null = null;

  eventLog.forEach((event, idx) => {
    const meta = getBlockMetadata(event.message);
    const eventMessage = getEventMessageObject(event, idx);

    if (meta) {
      // Start new block
      currentBlock = { ...meta, messages: [eventMessage] };
      blocks.unshift(currentBlock); // Most recent events at top
    } else if (currentBlock) {
      // Add to existing block
      if (event.message.includes("scores!") || event.message.includes("homers")) currentBlock.color = "#1B5E20";
      currentBlock.messages.unshift(eventMessage);
    } else {
      // No current block? Create a generic one
      currentBlock = { messages: [eventMessage] };
      blocks.unshift(currentBlock);
    }
  });

  return blocks;
}

const rawStats = selectedPlayer ? playerStats[selectedPlayer] : [];
const derivedStats = playerType === 'pitcher'
  ? formatPitcherStats(rawStats)
  : formatBatterStats(rawStats);

const displayStats = showDerived ? derivedStats : rawStats;
const displayKeys = Object.keys(displayStats);
const groupedEvents = groupEventLog(eventLog);

  return (
    <>
    <Navbar />
    <main className="mt-16">
      <CopiedPopup />
      <div className="min-h-screen bg-[#0c111b] text-white font-sans p-4 pt-20 max-w-3xl mx-auto">
        <GameHeader
          homeTeam={{
            name: data.HomeTeamName,
            emoji: data.HomeTeamEmoji,
            score: lastEvent.home_score,
            wins: homeTeam.Record["Regular Season"].Wins,
            losses: homeTeam.Record["Regular Season"].Losses,
            runDiff: homeTeam.Record["Regular Season"].RunDifferential,
            color: data.HomeTeamColor,
          }}
          awayTeam={{
            name: data.AwayTeamName,
            emoji: data.AwayTeamEmoji,
            score: lastEvent.away_score,
            wins: awayTeam.Record["Regular Season"].Wins,
            losses: awayTeam.Record["Regular Season"].Losses,
            runDiff: awayTeam.Record["Regular Season"].RunDifferential,
            color: data.AwayTeamColor,
          }}
          center={{
            icon: data.Weather.Emoji,
            title: data.Weather.Name,
            subtitle: data.Weather.Tooltip,
          }}
          inning={data.State != "Complete" ? (lastEvent.inning_side === 1 ? 'BOT' : 'TOP') + ' ' + lastEvent.inning : "FINAL"}
        />

        <GameStateDisplay
          balls={lastEvent.balls ?? 0}
          strikes={lastEvent.strikes ?? 0}
          outs={lastEvent.outs ?? 0}
          bases={{ first: lastEvent.on_1b, second: lastEvent.on_2b, third: lastEvent.on_3b }}
          pitcher={{
            name: lastEvent.pitcher,
            stat: lastEvent.pitcher !== "" ? `(${getERA(playerStats[lastEvent.pitcher])})` : "",
            onClick: () => {setSelectedPlayer(lastEvent.pitcher); setPlayerType('pitcher'); setShowStats(true);},
          }}
          batter={{
            name: lastEvent.batter,
            stat: lastEvent.batter !== "" ? `(${getBA(playerStats[lastEvent.batter])})` : "",
            onClick: () => {setSelectedPlayer(lastEvent.batter); setPlayerType('batter'); setShowStats(true);},
          }}
          onDeck={{
            name: lastEvent.on_deck,
            stat: lastEvent.on_deck !== "" ? `(${getBA(playerStats[lastEvent.on_deck])})` : "",
            onClick: () => {setSelectedPlayer(lastEvent.on_deck); setPlayerType('batter'); setShowStats(true);},
          }}
        />

        <>
          <div className="flex justify-between items-center mb-2 gap-2 mt-4">
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded-md"
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>

            <button
              onClick={() => setShowDerived(prev => !prev)}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded-md"
            >
              {showDerived ? 'Show Raw Stats' : 'Show Derived Stats'}
            </button>
          </div>


          {showStats ? (<>
            <h2>{selectedPlayer ? awayPlayers.includes(selectedPlayer) ? awayTeam.Emoji : homeTeam.Emoji : ''} {selectedPlayer}</h2>
            <div className="grid grid-cols-2 gap-x-4 text-sm">
            {displayStats ? (
              displayKeys.map((stat) => (
                <div key={stat} className="flex justify-between py-0.5">
                  <span className="text-gray-400">{stat}</span>
                  <span>{displayStats[stat] ?? '—'}</span>
                </div>
              ))
            ) : (
              <p>No stats available.</p>
            )}
          </div></>) : ''}
        </>

        <div className="mt-6 space-y-4">
            {groupedEvents.map((block, idx) => (
                <EventBlock key={idx} emoji={block.emoji} title={block.title} color={block.color} messages={block.messages}/>
            ))}
        </div>

      </div>
    </main>
    </>
  );
}
