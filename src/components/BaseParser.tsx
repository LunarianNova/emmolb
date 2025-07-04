'use client'

import { Bases } from "@/types/Bases";
import { useState } from "react";

<<<<<<< HEAD
type Bases = {
    first: string | null;
    second: string | null;
    third: string | null;
}

function extractOutPlayers(message: string, playerList: string[], check: string): string[] {
=======
function extractPlayers(message: string, playerList: string[], check: string): string[] {
>>>>>>> dcab695 (Proper Typing (sort of))
    const checkedSegments = message.split(/\. /).filter(s => (s.includes(check)));
    const checkedPlayers: string[] = [];

    for (const segment of checkedSegments) {
<<<<<<< HEAD
        const [rawNamePart] = segment.split(` ${check}`);
=======
        const [rawNamePart] = segment.split(` ${check} `);
>>>>>>> dcab695 (Proper Typing (sort of))
        const words = rawNamePart.trim().split(/\s+/);

        for (let i = 0; i < words.length; i++) {
            const candidate = words.slice(i).join(' ');
            if (playerList.includes(candidate)) {
                checkedPlayers.push(candidate);
                break;
            }
        }
    }

    return checkedPlayers;
}



export function ProcessMessage(event: any, players: string[], queue: string[]): {bases: Bases, baseQueue: string[]} {
    const message = event.message;
    const newQueue = [...queue];

    const scoreMatch = message.match(/scores!/g);
    for (let i = 0; i < (scoreMatch ? scoreMatch?.length : 0); i++)
        newQueue.shift();

    if (message.match(/starts the inning on/i))
<<<<<<< HEAD
        for (const player of extractOutPlayers(message, players, 'starts the inning on'))
=======
        for (const player of extractPlayers(message, players, 'starts the inning on'))
>>>>>>> dcab695 (Proper Typing (sort of))
            newQueue.push(player);

    if (message.match(/(singles|doubles|triples|walks|reaches on a fielding error|was hit by the pitch|into a forced out|reaches on a throwing error)/i))
        newQueue.push(event.batter);

    if (message.match(/(homers|grand slam)/i))
        newQueue.length = 0;

<<<<<<< HEAD
    if (event.outs === null)
        newQueue.length = 0;

    let outs = extractOutPlayers(message, players, 'out at');
    outs = [...outs, ...extractOutPlayers(message, players, 'is caught stealing')];
=======
    if (event.outs === null || event.outs === undefined)
        newQueue.length = 0;

    let outs = extractPlayers(message, players, 'out at');
    outs = [...outs, ...extractPlayers(message, players, 'is caught stealing')];
    outs = [...outs, ...extractPlayers(message, players, 'steals home')];
>>>>>>> dcab695 (Proper Typing (sort of))
    for (const player of outs) {
        const index = newQueue.indexOf(player);
        if (index !== -1) newQueue.splice(index, 1);
    }

<<<<<<< HEAD
    const bases: Bases = {
=======
    let bases: Bases = {
>>>>>>> dcab695 (Proper Typing (sort of))
        first: event.on_1b ? 
                event.on_2b ? 
                    event.on_3b ? 
                        newQueue[2] : 
                        newQueue[1] :
                        event.on_3b ?
                    newQueue[1] : 
                newQueue[0] : 
            null,
        second: event.on_2b ? event.on_3b ? newQueue[1] : newQueue[0] : null,
        third: event.on_3b ? newQueue[0] : null,
    };
    if ((!bases.first && event.on_1b) || (!bases.second && event.on_2b) || (!bases.third && event.on_3b)){
        bases = {
            first: event.on_1b ? 'Unknown' : null,
            second: event.on_2b ? 'Unknown' : null,
            third: event.on_3b ? 'Unknown' : null, 
        }
    }

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