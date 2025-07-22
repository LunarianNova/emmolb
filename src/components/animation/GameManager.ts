import { Event } from "@/types/Event";
import { TeamManager } from "./TeamManager";
import { Game } from "@/types/Game";
import { Announcer } from "./Announcer";
import { Bases } from "@/types/Bases";
import { ProcessMessage } from "../BaseParser";

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
    private baseStates: {bases: Bases, baseQueue: string[]}[] = [];
    private players: string[] = [];

    constructor({homeTeam, awayTeam, game, eventLog, announcer,}: {homeTeam: TeamManager; awayTeam: TeamManager, game: Game, eventLog: Event[]; announcer: Announcer;}) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.game = game;
        this.eventLog = eventLog;
        this.announcer = announcer;

        this.players = [...this.homeTeam.allPlayers.map((p) => (p.name)), ...this.awayTeam.allPlayers.map((p) => (p.name))];
        this.processBases();
    }

    private processBases() {
        const lastProcessed = Math.max(this.baseStates?.length - 1, 0);
        for (let i = lastProcessed; i < this.eventLog.length; i++) {
            const prevQueue = i > 0 ? this.baseStates[i-1].baseQueue ?? [] : [];
            this.baseStates.push(ProcessMessage(this.eventLog[i], this.players, prevQueue));
        }
    }

    updateEventLog(eventLog: Event[]) {
        this.eventLog = eventLog;
        this.processBases();
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

    togglePause() {
        if (this.isPlaying) this.stop();
        else this.start();
    }

    isComplete(): boolean {
        return this.eventLog[this.eventLog.length - 1].event === 'Recordkeeping';
    }

    getIsPlaying(): boolean {
        return this.isPlaying;
    }

    skipTo(eventIndex: number) {
        // Set up the prior event, and then call next() to animate current
        this.stop();
        const finalIndex = Math.max(0, Math.min(this.isComplete() ? this.eventLog.length - 1 : this.eventLog.length - 2, eventIndex))
        console.log('Final', finalIndex);
        console.log('Current', this.eventIndex);
        this.eventIndex = finalIndex;

        const cur = this.eventLog[this.eventIndex-1]

        if (cur.inning !== 0){
            this.fieldingTeam = cur.inning_side === 0 ? this.homeTeam : this.awayTeam;
            this.battingTeam = cur.inning_side === 0 ? this.awayTeam : this.homeTeam;

            this.fieldingTeam?.hardSwitchPitcher(cur.pitcher ?? '');
            this.battingTeam?.hardSwitchBatter(cur.batter ?? '');

            this.fieldingTeam?.resetPlayers(true);
            this.battingTeam?.setBases(this.baseStates[finalIndex].bases);
            this.battingTeam.resetPlayers(false);
        }

        this.announcer.setMessage(this.eventLog[this.eventIndex-2].message);
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