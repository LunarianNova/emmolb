'use client'

import { useState } from "react";

type Base = 'first' | 'second' | 'third'

type Bases = {
    first: string | null;
    second: string | null;
    third: string | null;
}

function extractOutPlayers(message: string, playerList: string[]): string[] {
    const outSegments = message.split(/\. /).filter(s => s.includes('out at'));
    const outPlayers: string[] = [];

    for (const segment of outSegments) {
        const [rawNamePart] = segment.split(' out at ');
        const words = rawNamePart.trim().split(/\s+/);

        for (let i = 0; i < words.length; i++) {
            const candidate = words.slice(i).join(' ');
            if (playerList.includes(candidate)) {
                outPlayers.push(candidate);
                break;
            }
        }
    }

    return outPlayers;
}



export function ProcessMessage(event: any, players: string[], queue: string[]): {bases: Bases, baseQueue: string[]} {
    const message = event.message;
    const newQueue = [...queue];

    const scoreMatch = message.match(/scores!/g);
    for (let i = 0; i < (scoreMatch ? scoreMatch?.length : 0); i++)
        newQueue.shift();

    if (message.match(/(singles|doubles|triples|walks|reaches on a fielding error)/i))
        newQueue.push(event.batter);

    if (message.match(/homers/i))
        newQueue.length = 0;

    if (message.outs === null || message.outs === undefined)
        newQueue.length = 0;

    const outs = extractOutPlayers(message, players);
    for (const player of outs) {
        const index = newQueue.indexOf(player);
        if (index !== -1) newQueue.splice(index, 1);
    }

    const occupiedBases = [event.on_1b, event.on_2b, event.on_3b].map((on, idx) => on ? idx : -1).filter(i => i !== -1);
    const bases: Bases = {
        third: occupiedBases[2] !== undefined ? newQueue[occupiedBases[2]] : null,
        second: occupiedBases[1] !== undefined ? newQueue[occupiedBases[1]] : null,
        first: occupiedBases[0] !== undefined ? newQueue[occupiedBases[0]] : null,
    };

    return {
        bases, baseQueue: newQueue
    };
}

export default function TestBasesPage() {
  const [results, setResults] = useState<any[]>([]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string);

        const playerNames: string[] = Array.from(new Set(data.map((entry: any) => entry.batter)));
        let currentQueue: string[] = [];

        const processed = data.map((entry: any) => {
          const result = ProcessMessage(entry, playerNames, currentQueue);
          currentQueue = result.baseQueue;
          return {
            message: entry.message,
            batter: entry.batter,
            baseQueue: [...result.baseQueue],
            bases: result.bases
          }
        });

        setResults(processed);
      } catch (err) {
        alert('Invalid JSON' + err);
      }
    }

    reader.readAsText(file);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Base State Tester</h1>
      <input type="file" accept=".json" onChange={handleFileUpload} className="mb-4" />

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, i) => (
            <div key={i} className="p-4 bg-theme-secondary border rounded">
              <p><strong>Message:</strong> {result.message}</p>
              <p><strong>Batter:</strong> {result.batter}</p>
              <p><strong>Queue:</strong> {JSON.stringify(result.baseQueue)}</p>
              <p><strong>Bases:</strong></p>
              <ul className="pl-4">
                <li>1B: {result.bases.first ?? '—'}</li>
                <li>2B: {result.bases.second ?? '—'}</li>
                <li>3B: {result.bases.third ?? '—'}</li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}