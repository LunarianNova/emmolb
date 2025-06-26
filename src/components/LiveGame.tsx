'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { GameHeader } from '@/components/GameHeader';
import { GameStateDisplay } from '@/components/GameStateDisplay';
import { EventBlock } from './EventBlock';

type Event = any; // ahhhh

type EventBlockGroup = {
  emoji?: string;
  title?: string;
  color?: string;
  messages: string[];
};

function getLuminance(hex: string): number {
  const c = hex.charAt(0) === '#' ? hex.substring(1) : hex;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const [R, G, B] = [r, g, b].map((ch) =>
    ch <= 0.03928 ? ch / 12.92 : Math.pow((ch + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastTextColor(bgHex: string): 'black' | 'white' {
  const luminance = getLuminance(bgHex);
  return luminance > 0.179 ? 'black' : 'white';
}

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
  
  // Use ref to keep track of lastEvent index without triggering effect rerun
  const lastEventIndexRef = useRef(lastEvent.index);

  // Update the ref whenever lastEvent changes
  useEffect(() => {
    lastEventIndexRef.current = lastEvent.index;
  }, [lastEvent]);
  const failureCountRef = useRef(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Handle tab/window activity state
  useEffect(() => {
    const onVisibilityChange = () => {
      setIsActive(!document.hidden);
    };
    const onFocus = () => setIsActive(true);
    const onBlur = () => setIsActive(false);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function poll() {
      if (!isMounted || !isActive) return;
      if (data.State === "Complete") {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          console.log("Polling stopped: game complete.");
        }
        return;
      }

      try {
        const res = await fetch(`/api/game/${gameId}/live?after=${lastEventIndexRef.current + 1}`);
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
  }, [gameId, isActive]); // include isActive to react to focus/blur

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
  if (message.includes('Mound Visit')) return { emoji: '🚶', title: 'Mound Visit' };
  if (message.includes('7.')) return { emoji: '🧾', title: 'Lineup (Will be teamed eventually...)' };
  if (message.includes('End') || message.includes('@') || message.includes('Start of the top of the 1st') || message.includes('Final score:')) return { emoji: 'ℹ️', title: 'Game Info' };


  return null; // Other events will be added to the latest group
}

function groupEventLog(eventLog: { message: string }[]): EventBlockGroup[] {
  const blocks: EventBlockGroup[] = [];
  let currentBlock: EventBlockGroup | null = null;

  for (const event of eventLog) {
    const meta = getBlockMetadata(event.message);

    if (meta) {
      // Start new block
      currentBlock = { ...meta, messages: [event.message] };
      blocks.unshift(currentBlock); // Most recent events at top
    } else if (currentBlock) {
      // Add to existing block
      if (event.message.includes("scores!")) currentBlock.color = "#1B5E20";
      currentBlock.messages.unshift(event.message);
    } else {
      // No current block? Create a generic one
      currentBlock = { messages: [event.message] };
      blocks.unshift(currentBlock);
    }
  }

  return blocks;
}

const groupedEvents = groupEventLog(eventLog);

  return (
    <main className="mt-16">
      <Navbar />
      <div className="min-h-screen text-black bg-amber-50 dark:bg-[#0c111b] dark:text-white font-sans p-4 pt-20 max-w-3xl mx-auto">
        <GameHeader
          homeTeam={{
            name: data.HomeTeamName,
            emoji: data.HomeTeamEmoji,
            score: lastEvent.home_score,
            wins: homeTeam.Record["Regular Season"].Wins,
            losses: homeTeam.Record["Regular Season"].Losses,
            runDiff: homeTeam.Record["Regular Season"].RunDifferential,
            color: data.HomeTeamColor,
            textColor: getContrastTextColor(data.HomeTeamColor),
          }}
          awayTeam={{
            name: data.AwayTeamName,
            emoji: data.AwayTeamEmoji,
            score: lastEvent.away_score,
            wins: awayTeam.Record["Regular Season"].Wins,
            losses: awayTeam.Record["Regular Season"].Losses,
            runDiff: awayTeam.Record["Regular Season"].RunDifferential,
            color: data.AwayTeamColor,
            textColor: getContrastTextColor(data.AwayTeamColor),
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
          pitcher={{ name: lastEvent.pitcher, stat: lastEvent.pitcher != "" ? `(${getERA(playerStats[lastEvent.pitcher])})` : ""}}
          batter={{ name: lastEvent.batter, stat: lastEvent.batter != "" ? `(${getBA(playerStats[lastEvent.batter])})` : ""}}
          onDeck={{ name: lastEvent.on_deck, stat: lastEvent.on_deck != "" ? `(${getBA(playerStats[lastEvent.on_deck])})` : ""}}
        />

        <div className="mt-6 space-y-4">
            {groupedEvents.map((block, idx) => (
                <EventBlock key={idx} emoji={block.emoji} title={block.title} color={block.color}>
                    {block.messages.map((msg, i) => (
                    <div key={i} dangerouslySetInnerHTML={{__html: msg}} />
                    ))}
                </EventBlock>
            ))}
        </div>

      </div>
    </main>
  );
}
