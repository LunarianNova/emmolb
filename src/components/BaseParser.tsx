// /components/BaseParser.tsx
// Authors: Navy, Luna
'use client'

import { Bases } from "@/types/Bases";
import { Event } from "@/types/Event";
import { BatterGameStats, GameStats, PitcherGameStats } from "@/types/GameStats";

function extractPlayers(message: string, playerList: Set<string>, check: string): string[] {
    const checkedSegments = message.split(/\. /).filter(s => (s.includes(check)));
    const checkedPlayers: string[] = [];

    for (const segment of checkedSegments) {
        const [rawNamePart] = segment.split(` ${check} `);
        const words = rawNamePart.trim().split(/\s+/);

        for (let i = 0; i < words.length; i++) {
            const candidate = words.slice(i).join(' ');
            if (playerList.has(candidate)) {
                checkedPlayers.push(candidate);
                break;
            }
        }
    }

    return checkedPlayers;
}

function assignBases(event: Event, queue: string[]): Bases {
    const { on_1b, on_2b, on_3b } = event;

    let third = null, second = null, first = null;
    let qIndex = 0;

    if (on_3b) third = queue[qIndex++] ?? 'Unknown';
    if (on_2b) second = queue[qIndex++] ?? 'Unknown';
    if (on_1b) first = queue[qIndex++] ?? 'Unknown';

    return { first, second, third };
}

export function ProcessMessage(event: Event, players: string[], gameStats: GameStats, queue: string[]): {bases: Bases, baseQueue: string[]} {
    const message = event.message;
    const playerSet = new Set(players);
    const newQueue = [...queue];
    const scoreboard = (event.inning_side === 0) ? gameStats.away : gameStats.home;
    if (scoreboard.runsByInning.length < event.inning)
        scoreboard.runsByInning.push(0);

    if (event.batter && !gameStats.batters[event.batter]) gameStats.batters[event.batter] = BatterGameStats();
    const batterStats = (event.batter) ? gameStats.batters[event.batter] : null;
    if (event.pitcher && !gameStats.pitchers[event.pitcher]) gameStats.pitchers[event.pitcher] = PitcherGameStats();
    const pitcherStats = (event.pitcher) ? gameStats.pitchers[event.pitcher] : null;

    const scoreCount = (message.match(/scores!/g) ?? []).length;
    for (let i = 0; i < scoreCount; i++) {
        const scoringPlayer = newQueue.shift();
        if (scoringPlayer && scoringPlayer != 'Unknown') {
            if (!gameStats.batters[scoringPlayer]) gameStats.batters[scoringPlayer] = BatterGameStats();
            gameStats.batters[scoringPlayer].runs++;
            // todo: earned runs, track responsible pitchers
        }
    }
    if (scoreCount > 0) {
        scoreboard.runsByInning[event.inning - 1] += scoreCount;
    }

    const startsInning = /starts the inning on/i.test(message);
    const hit = /(singles|doubles|triples)/i.test(message);
    const homer = /(homers|grand slam)/i.test(message);
    const walk = /walks/i.test(message);
    const hbp = /was hit by the pitch/i.test(message);
    const error = /(fielding error|throwing error)/i.test(message);
    const sacFly = /sacrifice fly/i.test(message);
    const doublePlay = /double play/i.test(message);
    const out = !sacFly && /(grounds out|lines out|flies out|pops out)/i.test(message);
    const strikeout = /struck out/i.test(message);
    const fc = !error && /(fielder's choice|force out)/i.test(message);
    const ball = walk || hbp || /^Ball/.test(message);
    const strike = hit || homer || error || out || fc || strikeout || /(^Strike|^Foul)/.test(message);
    const inningEnd = event.outs === null || event.outs === undefined;

    if (hit || homer) {
        scoreboard.hits++;
    } else if (error) {
        ((event.inning_side === 0) ? gameStats.home : gameStats.away).errors++;
    }

    if (batterStats) {
        if (hit || homer || out || strikeout || fc || doublePlay) batterStats.atBats++;
        if (hit || homer) batterStats.hits++;
        if (homer) {
            batterStats.homeRuns++;
            batterStats.runs++;
        }
        if (scoreCount > 0 && !error && !doublePlay) batterStats.rbi += scoreCount;
    }

    if (pitcherStats) {
        if (strike) pitcherStats.strikesThrown++;
        if (strike || ball) pitcherStats.pitchCount++;
        if (hit || homer) pitcherStats.hits;
        if (out || strikeout || fc) pitcherStats.outsRecorded++;
        if (doublePlay) pitcherStats.outsRecorded += 2;
        if (strikeout) pitcherStats.strikeouts;
        if (walk) pitcherStats.walks;
    }

    // TODO: outs from caught stealing and runs from stealing home

    if (startsInning) {
        const starters = extractPlayers(message, playerSet, 'starts the inning on');
        newQueue.push(...starters);
    }

    if (hit || walk || hbp || error || fc)
        newQueue.push(event.batter ? event.batter : 'Unknown');

    let outs = extractPlayers(message, playerSet, 'out at');
    outs = outs.concat(extractPlayers(message, playerSet, 'is caught stealing'));
    outs = outs.concat(extractPlayers(message, playerSet, 'steals home'));
    for (const player of outs) {
        const index = newQueue.indexOf(player);
        if (index !== -1) newQueue.splice(index, 1);
    }

    if (inningEnd) {
        scoreboard.leftOnBase += newQueue.length;
    }

    if (homer || inningEnd)
        newQueue.length = 0;

    const bases = assignBases(event, newQueue);

    return {
        bases,
        baseQueue: newQueue
    };
}