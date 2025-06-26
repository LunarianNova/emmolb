import { GameHeader } from "@/components/GameHeader";
import { GameStateDisplay } from "@/components/GameStateDisplay";
import { Navbar } from "@/components/Navbar";

// src/app/game/test/page.tsx
export default function GameTestPage() {
  return (
    <main className="mt-16">
        <Navbar />
        <div className="min-h-screen bg-[#0c111b] text-white font-sans p-4 pt-20 max-w-3xl mx-auto">
            <GameHeader
                homeTeam={{
                    name: 'Echo Cluster',
                    emoji: '🫥',
                    score: 3,
                    wins: 15,
                    losses: 7,
                    runDiff: 12,
                    color: '#ffffff'
                }}
                awayTeam={{
                    name: 'Halifax Damp Talkers',
                    emoji: '💦',
                    score: 8,
                    wins: 13,
                    losses: 9,
                    runDiff: -5,
                    color: '#ffffff'
                }}
                center={{
                    icon: '🚚',
                    title: 'Shipment',
                    subtitle: 'Three magic items are delivered.',
                }}
                inning="TOP 8"
                />

            <GameStateDisplay
                balls={2}
                strikes={1}
                outs={1}
                bases={{ first: true, second: false, third: true }}
                pitcher={{ name: 'Alex Parsons', stat: '2.85 ERA' }}
                batter={{ name: 'Ivan Yamanaka', stat: '.311 BA' }}
                onDeck={{ name: 'Iry Northrop', stat: '.256 BA' }}
                />
        </div>
    </main>
  )
}
