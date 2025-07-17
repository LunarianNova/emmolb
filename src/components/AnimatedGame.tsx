// Author: Luna
// I had a brain wave and this came to me in a dream

'use client'
import { ProcessMessage } from "@/components/BaseParser";
import { Bases } from "@/types/Bases";
import { Event } from "@/types/Event";
import { useEffect, useState } from "react";

type GameState = {
    event?: number;
    outs?: number; // 0-3
    strikes?: number; // 0-3
    balls?: number; // 0-3
    onDeck?: string; // Player Name (or id)
    batting?: string; // Player Name (or id)
    pitching?: string; // Player Name (or id)
    homeScore?: number;
    awayScore?: number;
    homeName?: string;
    awayName?: string;
    inning?: number;
    inningSide?: number; // 1 = Bottom, 2 = Top (enum?)
    isGameOver?: boolean;
    bases?: Bases;
    baseQueue?: string[];
}

function parseEvent(gameState: GameState, event: Event, players: string[]): GameState {
    const { bases, baseQueue } = ProcessMessage(event, players, gameState.baseQueue ? gameState.baseQueue : []);
    return {
        ...gameState,
        event: event.index,
        bases,
        baseQueue,
        outs: event.outs,
        strikes: event.strikes,
        balls: event.balls,
        onDeck: event.on_deck,
        batting: event.batter,
        pitching: event.pitcher,
        homeScore: event.home_score,
        awayScore: event.away_score,
        inning: event.inning,
        inningSide: event.inning_side,
        isGameOver: event.event === "RecordKeeping",
    };
}

// So basically what I want to do here is make it so it processes every message
// Then I want it to have a three message buffer
// It can then use this buffer to look ahead and see the outcome of the current event
// E.G. If the next event has someone stealing a base, then make them start walking towards it during this time frame

export default function LivePage({ id }: {id: string}) {
    const [gameStates, setGameStates] = useState<GameState[]>([]);
    const [eventIndex, setEventIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);

    // Real data goes here
    // With a /gameheaders fetch it should be easy enough
    const events: Event[] = [];
    const players: string[] = [];
    const initialGameState: GameState = {};

    // Build all game states on page open (laggy probably)
    useEffect(() => {
        if (!events.length) return;

        const states: GameState[] = [];
        let currentState = { ...initialGameState };

        for (let i = 0; i < events.length; i++) {
            currentState = parseEvent(currentState, events[i], players);
            states.push(JSON.parse(JSON.stringify(currentState))); // Is a deep copy really needed? Uh, remove it and find out?
        }

        setGameStates(states);
    }, [events]);

    const currentState = gameStates[eventIndex];

    return (
        <div>
            <div className="controls mt-20">
                <button onClick={() => setEventIndex(i => Math.max(0, i - 1))}>⏮️</button>
                <button onClick={() => setIsPlaying(p => !p)}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={() => setEventIndex(i => Math.min(gameStates.length - 1, i + 1))}>⏭️</button>
            </div>

            <div className="state">
                <pre>{JSON.stringify(currentState, null, 2)}</pre>
            </div>
        </div>
    );
}