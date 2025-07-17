// Author: Luna
// I had a brain wave and this came to me in a dream

import { ProcessMessage } from "@/components/BaseParser";
import { Bases } from "@/types/Bases";
import { Event } from "@/types/Event";
import { Game } from "@/types/Game";

type GameState = {
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
    on_1b?: string;  // Player Name (or id)
    on_2b?: string;
    on_3b?: string;
    isGameOver?: boolean;
}

function isGameOver(event_log: Event[], game: Game) {
    return event_log[event_log.length - 1].event === "RecordKeeping" || game.state === "Complete"
}

function parseEvent(event: Event, players: string[], queue: string[]) {
    const { bases, baseQueue } = ProcessMessage(event, players, queue);
}

// So basically what I want to do here is make it so it processes every message
// Then I want it to have a three message buffer
// It can then use this buffer to look ahead and see the outcome of the current event
// E.G. If the next event has someone stealing a base, then make them start walking towards it during this time frame