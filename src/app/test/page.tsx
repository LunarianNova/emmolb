// 'use client';
// import React, { useState } from "react";

import TestBasesPage from "@/components/BaseParser";

// type Entry = {
//     away_score: number,
//     balls: number,
//     batter: string | null,
//     event: string,
//     home_score: number,
//     index: number,
//     inning: number,
//     inning_side: number,
//     message: string,
//     on_1b: boolean,
//     on_2b: boolean,
//     on_3b: boolean,
//     on_deck: string | null,
//     outs: number,
//     pitch_info: string,
//     pitcher: string | null,
//     strikes: number,
//     zone: string,
// };

// type Bases = {
//     first: string | boolean | null,
//     second: string | boolean | null,
//     third: string | boolean | null,
// };

// function isLikelyName(name: string): boolean {
//   return name.trim().split(' ').every(word => /^[A-Z][a-z'-]+$/.test(word));
// }

// export function parseLogs(logs: Entry[]) {
//     const baseState: Bases = {
//         first: null,
//         second: null,
//         third: null,
//     };

//     const baseStates: {index: number; message: string; baseState: Bases; inferredBases: Bases}[] = [];

//     for (let i = 0; i < logs.length; i++) {
//         const log = logs[i];
//         const newState: Bases = { first: log.on_1b, second: log.on_2b, third: log.on_3b };
//         const inferredState: Bases = { ...baseState };

//         // Reset at end of inning halves
//         if (/End of the (top|bottom) of the/.test(log.message)) {
//             inferredState.first = null;
//             inferredState.second = null;
//             inferredState.third = null;
//         }

//         const startOnBaseMatch = log.message.match(/\b(\p{Lu}[\p{Ll}' -]+(?:\s\p{Lu}[\p{Ll}' -]+)*)\b starts the inning on (first|second|third) base/u);
//         startOnBaseMatch ? console.log(log.index, startOnBaseMatch[1], startOnBaseMatch[3]) : '';
//         if (startOnBaseMatch) {
//             const player = startOnBaseMatch[1].trim();
//             const baseKey = startOnBaseMatch[3] as keyof Bases;
//             inferredState[baseKey] = player;
//         }

//         const singleMatch = log.message.match(/(?:^|\.\s)([A-Z][a-z .'-]+?) (singles|walks)\b/i);
//         if (singleMatch) {
//             const player = singleMatch[1].trim();
//             if (!inferredState.first) inferredState.first = player;
//             else if (!inferredState.second) inferredState.second = inferredState.first, inferredState.first = player;
//             else if (!inferredState.third) inferredState.third = inferredState.second, inferredState.second = inferredState.first, inferredState.first = player;
//         }

//         const unforcedAdvanceMatch = log.message.match(/\b(\p{Lu}[\p{Ll}' -]+(\s\p{Lu}[\p{Ll}' -]+)?)\b to (first|second|third|home) base/u);
//         if (unforcedAdvanceMatch && isLikelyName(unforcedAdvanceMatch[1])) {
//             const player = unforcedAdvanceMatch[1].trim();
//             const targetBase = unforcedAdvanceMatch[3];
//             for (const base of ['first', 'second', 'third'] as (keyof Bases)[]) {
//                 if (inferredState[base] === player) inferredState[base] = null;
//             }
//             if (targetBase !== 'home'){
//                 const baseKey = targetBase as keyof Bases;
//                 inferredState[baseKey] = player
//             }
//         }

//         const doubleMatch = log.message.match(/(?:^|\.\s)([A-Z][a-z .'-]+?) doubles\b/i);
//         if (doubleMatch) {
//             const player = doubleMatch[1].trim();
//             if (!inferredState.first && !inferredState.second && !inferredState.third) inferredState.second = player;
//             else if (inferredState.first && !inferredState.second) inferredState.third = inferredState.first, inferredState.second = player, inferredState.first = null;
//             else if (inferredState.first && inferredState.second && !inferredState.third) inferredState.third = inferredState.second, inferredState.second = player, inferredState.first = null;
//             else inferredState.second = player;
//         }

//         const tripleMatch = log.message.match(/(?:^|\.\s)([A-Z][a-z .'-]+?) triples\b/i);
//         if (tripleMatch) {
//             const player = tripleMatch[1].trim();
//             inferredState.first = null;
//             inferredState.second = null;
//             inferredState.third = player;
//         }

//         if (/homers/.test(log.message)){
//             inferredState.first = null;
//             inferredState.second = null;
//             inferredState.third = null;
//         }

//         const scoringMatch = log.message.match(/([A-Z][a-z]+(?: [A-z][a-z]+)?) scores!/i)
//         if (scoringMatch) {
//             const player = scoringMatch[1].trim();
//             for (const base of ['first', 'second', 'third'] as (keyof Bases)[]) {
//                 if (inferredState[base] === player) inferredState[base] = null;
//             }
//         }

//         const stealMatch = log.message.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)?) steals (first|second|third) base!/i); 
//         if (stealMatch) {
//             const player = stealMatch[1].trim();
//             const targetBase = stealMatch[2];
//             for (const base of ['first', 'second', 'third'] as (keyof Bases)[]) {
//                 if (inferredState[base] === player) inferredState[base] = null;
//             }
//             const baseKey = targetBase as keyof Bases;
//             inferredState[baseKey] = player;
//         } 

//         const caughtStealingMatch = log.message.match(/(?:^|\.\s)([A-Z][a-z .'-]+?) is caught stealing\b/i);
//         if (caughtStealingMatch) {
//             const player = caughtStealingMatch[1].trim();
//             for (const base of ['first', 'second', 'third'] as (keyof Bases)[]) {
//                 if (inferredState[base] === player) inferredState[base] = null;
//             }
//         }

//         const outMatch = log.message.match(/grounds? out/i) || log.message.match(/flies? out/i);
//         if (outMatch){
//             // For now assume players stay
//         }

//         if (log.message.includes('double play')) {
//             const names = log.message.match(/([A-Za-z .'-]) out at/i);
//             if (names) {
//                 const runner = names[1].trim();
//                 Object.entries(inferredState).forEach(([base, player]) => {
//                     if (player === runner) inferredState[base as keyof Bases] = null;
//                 })
//             }
//         }

//         baseStates.push({
//             index: log.index,
//             message: log.message,
//             baseState: newState,
//             inferredBases: inferredState,
//         });

//         Object.assign(baseState, inferredState);
//     }

//     return baseStates;
// }

// export default function JsonProcessor() {
//     const [logs, setLogs] = useState<Entry[] | null>(null);

//     const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onload = (e) => {
//             try {
//                 const text = e.target?.result as string;
//                 const json = JSON.parse(text);
//                 if (!Array.isArray(json.entries)) throw new Error("Invalid JSON");

//                 setLogs(json.entries);
//             } catch (err) {
//                 console.error("Invalid JSON File");
//                 alert("Failed to parse JSON");
//             }
//         };
//         reader.readAsText(file);
//     };

//     let result: {index: number; message: string; baseState: Bases; inferredBases: Bases}[] = [];
//     logs ? result = parseLogs(logs) : '';

//     return (
//         <>
//         <input type='file' accept='.json' onChange={handleFileUpload} />
//         <div className="space-y-2">
//             {result.map(({ index, message, baseState, inferredBases }) => {
//   const mismatch = ['first', 'second', 'third'].some(
//     (base) => !!baseState[base as keyof Bases] !== !!inferredBases[base as keyof Bases]
//   );

//   return (
//     <div
//       key={index}
//       className={`p-2 rounded border ${
//         mismatch ? 'border-red-500 bg-red-900' : 'border-gray-600 bg-gray-800'
//       }`}
//     >
//       <div className="text-sm font-mono text-white">
//         <strong>#{index}</strong>: {message}
//       </div>

//       {mismatch && (
//         <div className="mt-1 text-xs text-red-300 font-mono">
//           <div>⚠ Mismatch Detected:</div>
//           {['first', 'second', 'third'].map((base) => {
//             const api = baseState[base as keyof Bases];
//             const inferred = inferredBases[base as keyof Bases];
//             const diff = !!api !== !!inferred;
//             return diff ? (
//               <div key={base}>
//                 {base} base → API: <b>{String(api)}</b>, Inferred: <b>{String(inferred)}</b>
//               </div>
//             ) : null;
//           })}
//         </div>
//       )}
//     </div>
//   );
// })}
//         </div>
//         </>
//     );
// }
export default function placeholder() {
    return (
        <TestBasesPage />
    );
}