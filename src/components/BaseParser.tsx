// /components/BaseParser.tsx
// Authors: Navy, Luna
'use client'

import { Bases } from "@/types/Bases";
import { Event } from "@/types/Event";

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

    let first = null, second = null, third = null;

    if (on_3b) third = queue[0] ?? 'Unknown';
    if (on_2b) second = on_3b ? queue[1] ?? 'Unknown' : queue[0] ?? 'Unknown';
    if (on_1b) first = on_2b ? (on_3b ? queue[2] ?? 'Unknown' : queue[1] ?? 'Unknown') : (queue[0] ?? 'Unknown');

    if (!on_1b) first = null;
    if (!on_2b) second = null;
    if (!on_3b) third = null;

    return { first, second, third };
}

export function ProcessMessage(event: Event, players: string[], queue: string[]): {bases: Bases, baseQueue: string[]} {
    const message = event.message;
    const playerSet = new Set(players);
    const newQueue = [...queue];

    const scoreCount = (message.match(/scores!/g) ?? []).length;
    for (let i = 0; i < scoreCount; i++) newQueue.shift();

    const startsInning = /starts the inning on/i.test(message);
    const hitsOrWalks = /(singles|doubles|triples|walks|reaches on a fielding error|was hit by the pitch|into a forced out|reaches on a throwing error|reaches on)/i.test(message);
    const homer = /(homers|grand slam)/i.test(message);
    const inningEnd = event.outs === null || event.outs === undefined;

    if (startsInning) {
        const starters = extractPlayers(message, playerSet, 'starts the inning on');
        newQueue.push(...starters);
    }

    if (hitsOrWalks)
        newQueue.push(event.batter ? event.batter : 'Unknown');

    if (homer || inningEnd)
        newQueue.length = 0;

    let outs = extractPlayers(message, playerSet, 'out at');
    outs = outs.concat(extractPlayers(message, playerSet, 'is caught stealing'));
    outs = outs.concat(extractPlayers(message, playerSet, 'steals home'));
    for (const player of outs) {
        const index = newQueue.indexOf(player);
        if (index !== -1) newQueue.splice(index, 1);
    }

    const bases = assignBases(event, newQueue);

    return {
        bases,
        baseQueue: newQueue
    };
}