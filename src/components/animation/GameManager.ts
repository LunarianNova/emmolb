import { Event } from "@/types/Event";
import { TeamManager } from "./TeamManager";
import { Game } from "@/types/Game";
import { Announcer } from "./Announcer";

export class GameManager {
    homeTeam: TeamManager;
    awayTeam: TeamManager;
    game: Game;
    eventLog: Event[];
    announcer: Announcer;
    private eventIndex: number = 0;
    private intervalID: number | null = null;
    private isPlaying: boolean = false;
    private fieldingTeam: TeamManager | null = null;
    private battingTeam: TeamManager | null = null;

    constructor({homeTeam, awayTeam, game, eventLog, announcer,}: {homeTeam: TeamManager; awayTeam: TeamManager, game: Game, eventLog: Event[]; announcer: Announcer;}) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.game = game;
        this.eventLog = eventLog;
        this.announcer = announcer;
    }

    updateEventLog(eventLog: Event[]) {
        this.eventLog = eventLog;
    }

    getEventIndex(): number {
        return this.eventIndex;
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.processNextEvent();
    }

    stop() {
        this.isPlaying = false;
        if (this.intervalID !== null) clearTimeout(this.intervalID);
    }

    next() {
        this.processNextEvent();
    }

    private processNextEvent() {
        if (this.eventIndex >= this.eventLog.length - 1) {
            this.intervalID = window.setTimeout(() => {
                if (this.isPlaying) this.processNextEvent();
            }, 6000);
            return;
        }

        const prev = this.eventLog[this.eventIndex - 1] || null;
        const cur = this.eventLog[this.eventIndex];
        const next = this.eventLog[this.eventIndex + 1] || null;

        this.handleEvent({prev, cur, next});
        this.eventIndex++;

        this.intervalID = window.setTimeout(() => {
            if (this.isPlaying) this.processNextEvent();
        }, 6000);
    }

    private handleEvent({prev, cur, next}: {prev: Event | null, cur: Event, next: Event | null}) {
        this.fieldingTeam = cur.inning_side === 0 ? this.homeTeam : this.awayTeam;
        this.battingTeam = cur.inning_side === 0 ? this.awayTeam : this.homeTeam;

        if (cur.pitcher !== prev?.pitcher) this.fieldingTeam.switchPitcher(cur.pitcher ?? '');
        if (cur.batter !== prev?.batter) this.battingTeam.switchBatter(cur.batter ?? '');

        switch (cur.event) {
            case 'InningEnd':
            case 'PlayBall':  // 'PlayBall' to catch the first inning's start
                this.fieldingTeam.endFieldingInning();
                this.battingTeam.startFieldingInning();
                break;
        }

        // Default message shows on page load
        this.announcer.sayMessage({text: prev?.message ?? "Howdy! If you're on mobile, this page is fully intended to be viewed in landscape mode. Report any bugs in the offical MMOLB Discord please.", duration: 4000});
    }
}