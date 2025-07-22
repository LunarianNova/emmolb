import { Event } from "@/types/Event";
import { TeamManager } from "./TeamManager";
import { Game } from "@/types/Game";
import { Announcer } from "./Announcer";
import { Bases } from "@/types/Bases";
import { ProcessMessage } from "../BaseParser";
import { positions } from "./Constants";

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
    private animationQueue: Promise<void> = Promise.resolve();

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

    getBasePaths(prevBases: Bases, curBases: Bases): Record<string, string[]> {
        const paths: Record<string, string[]> = {};
        const baseOrder = ['first', 'second', 'third'];
        const positionOrder = ['First', 'Second', 'Third', 'Home'];

        function capitalize(s: string): string {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }

        for (const base of baseOrder) {
            const baseStateKey = base as keyof Bases;
            const player = prevBases[baseStateKey];
            if (!player) continue;

            let toBase = baseOrder.find(b => curBases[b as keyof Bases] === player);
            if (!toBase) toBase = 'Home'; // Assume they scored (Will do parsing later)
            if (toBase === base) continue;

            const fromIndex = positionOrder.indexOf(capitalize(base));
            const toIndex = positionOrder.indexOf(capitalize(toBase));

            if (fromIndex < 0 || toIndex < 0 || toIndex < fromIndex) continue;
            paths[player] = positionOrder.slice(fromIndex + 1, toIndex + 1);
        }

        // Check for batter (not in prev)
        for (const base of baseOrder) {
            const baseStateKey = base as keyof Bases;
            const player = curBases[baseStateKey];
            if (!player) continue;
            if (Object.values(prevBases).includes(player)) continue;

            const toIndex = positionOrder.indexOf(capitalize(base));
            if (toIndex < 0) continue; // Skip if invalid

            paths[player] = positionOrder.slice(0, toIndex + 1);
        }

        console.log(paths);
        return paths;
    }

    skipTo(eventIndex: number) {
        // Set up the prior event, and then call next() to animate current
        this.stop();
        const finalIndex = Math.max(0, Math.min(this.isComplete() ? this.eventLog.length - 1 : this.eventLog.length - 2, eventIndex))
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
            case 'Field': {
                const prevBases = this.baseStates[prev?.index ?? 0];
                const curBases = this.baseStates[cur.index];
                this.battingTeam.currentBatter = undefined;
                this.battingTeam.firstBaseRunner = curBases.bases.first ? this.battingTeam.playersByName[curBases.bases.first] : undefined;
                this.battingTeam.secondBaseRunner = curBases.bases.second ? this.battingTeam.playersByName[curBases.bases.second] : undefined;
                this.battingTeam.thirdBaseRunner = curBases.bases.third ? this.battingTeam.playersByName[curBases.bases.third] : undefined;

                if (!prevBases || !curBases) break;
                const paths = this.getBasePaths(prevBases.bases, curBases.bases);

                const tasks = Object.entries(paths).map(([playerName, path]) => async () => {
                    const player = this.battingTeam?.playersByName[playerName];
                    if (!player) return;

                    for (const base of path) {
                        await player.walkTo(positions[base]);
                    }
                    player.turnAround('front');
                });

                this.runParallel(tasks);
                break;
            }
        }

        // Default message shows on page load
        this.announcer.sayMessage({text: prev?.message ?? "Howdy! If you're on mobile, this page is fully intended to be viewed in landscape mode. Report any bugs in the offical MMOLB Discord please.", duration: 4000});
    }

    private runParallel(tasks: (() => Promise<void>)[]) {
        return Promise.all(tasks.map(task => task().catch(() => {})));
    }

    private queue(task: () => Promise<void>) {
        this.animationQueue = this.animationQueue.then(task).catch(() => {});
    }
}