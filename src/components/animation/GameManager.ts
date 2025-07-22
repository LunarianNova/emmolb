import { Event } from "@/types/Event";
import { TeamManager } from "./TeamManager";
import { Game } from "@/types/Game";
import { Announcer } from "./Announcer";
import { Bases } from "@/types/Bases";
import { ProcessMessage } from "../BaseParser";
import { inverseFielderLabels, positions } from "./Constants";
import { Ball } from "./Ball";
import { RefObject } from "react";
import { Vector2 } from "@/types/Vector2";

export class GameManager {
    homeTeam: TeamManager;
    awayTeam: TeamManager;
    game: Game;
    eventLog: Event[];
    announcer: Announcer;
    private svgRef: RefObject<SVGSVGElement | null>
    private eventIndex: number = 0;
    private intervalID: number | null = null;
    private isPlaying: boolean = false;
    private fieldingTeam: TeamManager | null = null;
    private battingTeam: TeamManager | null = null;
    private baseStates: {bases: Bases, baseQueue: string[]}[] = [];
    private players: string[] = [];
    private animationQueue: Promise<void> = Promise.resolve();

    constructor({homeTeam, awayTeam, game, eventLog, announcer, svgRef,}: {homeTeam: TeamManager; awayTeam: TeamManager, game: Game, eventLog: Event[]; announcer: Announcer; svgRef: RefObject<SVGSVGElement | null>;}) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.game = game;
        this.eventLog = eventLog;
        this.announcer = announcer;
        this.svgRef = svgRef;

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

    private createBall(startPos: Vector2): Ball {
        const ball = new Ball(startPos);
        this.svgRef.current?.appendChild(ball.group);
        return ball;
    }

    private async foulBallAnimation(hand: 'L' | 'R') {
        const foulPositions: Record<string, Vector2> = {'L': new Vector2(-150, -10), 'R': new Vector2(1150, -10)};
        const ball = this.createBall(positions['Home']);
        const hitPos = Math.random() >= 0.3 ? foulPositions[hand] : foulPositions[hand === 'L' ? 'R' : 'L'];
        await ball.throwTo(new Vector2((hitPos.x-30)+Math.random()*60), 100+Math.random()*50);
        this.svgRef.current?.removeChild(ball.group);
    }

    private parseThrowChain(msg: string, start: keyof typeof positions): (keyof typeof positions)[] {
        const chain: (keyof typeof positions)[] = ["Home", start];
        const [, throwPart] = msg.split(",", 2);
        const matches = [...(throwPart?.matchAll(/\b([1-3][B]|SS|[LRC]F)\b/g) ?? [])].slice(1); // Remove the duplicate 'start' position
        for (const match of matches) {
            const pos = inverseFielderLabels[match[1]];
            if (pos) chain.push(pos); // Only add defined ones
        }
        return chain;
    }


    private async processHitBall(index: number) {
        const curEvent = this.eventLog[index];
        const nextEvent = this.eventLog[index+1];
        if (!curEvent || !nextEvent) return;

        const ball = this.createBall(positions['Home']);
        const hitLocation = this.getHitLocation(curEvent.message);
        const throwChain = this.parseThrowChain(curEvent.message, hitLocation);

        for (const location of throwChain) {
            await ball.throwTo(positions[location]);
        }
        this.svgRef.current?.removeChild(ball.group);
    }

    private getHitLocation(msg: string): keyof typeof positions {
        if (msg.includes("to center field")) return "CenterFielder";
        if (msg.includes("to left field")) return "LeftFielder";
        if (msg.includes("to right field")) return "RightFielder";
        if (msg.includes("to first base")) return "FirstBaseman";
        if (msg.includes("to second base")) return "SecondBaseman";
        if (msg.includes("to third base")) return "ThirdBaseman";
        if (msg.includes("to the shortstop")) return "Shortstop";
        if (msg.includes("to the pitcher")) return "Pitcher";
        return "Home";
    }

    private advanceBases(index: number) {
        if (!this.battingTeam || !this.fieldingTeam) return;

        const prevBases = this.baseStates[index-1];
        const curBases = this.baseStates[index];
        this.battingTeam.currentBatter = undefined;
        this.battingTeam.firstBaseRunner = curBases.bases.first ? this.battingTeam.playersByName[curBases.bases.first] : undefined;
        this.battingTeam.secondBaseRunner = curBases.bases.second ? this.battingTeam.playersByName[curBases.bases.second] : undefined;
        this.battingTeam.thirdBaseRunner = curBases.bases.third ? this.battingTeam.playersByName[curBases.bases.third] : undefined;

        if (!prevBases || !curBases) return;
        const paths = this.getBasePaths(prevBases.bases, curBases.bases);

        const tasks = Object.entries(paths).map(([playerName, path]) => async () => {
            const player = this.battingTeam?.playersByName[playerName];
            if (!player) return;

            for (const base of path) {
                await player.walkTo(positions[base]);
            }
            player.turnAround('front');
            if (path[path.length - 1] === 'Home') await player.walkOff();
        });

        this.runParallel(tasks);
    }

    private async handleEvent({prev, cur, next}: {prev: Event | null, cur: Event, next: Event | null}) {
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
            case 'Pitch': {
                if (cur.message.includes('steals')) this.advanceBases(cur.index);
                const ball = this.createBall(positions['Pitcher']);
                await ball.throwTo(positions['Home']);
                this.svgRef.current?.removeChild(ball.group);
                if (cur.message.includes('Foul')) this.foulBallAnimation(this.battingTeam.currentBatter?.posVector === positions['LeftHandedBatter'] ? 'L' : 'R');
                if (cur.message.includes('hits')) {
                    this.processHitBall(cur.index);
                    this.advanceBases(next?.index ?? 0);
                }
            }
        }

        // Default message shows on page load
        this.announcer.sayMessage({text: cur.message ?? "Howdy! If you're on mobile, this page is fully intended to be viewed in landscape mode. Report any bugs in the offical MMOLB Discord please.", duration: 4000});
    }

    private runParallel(tasks: (() => Promise<void>)[]) {
        return Promise.all(tasks.map(task => task().catch(() => {})));
    }

    private queue(task: () => Promise<void>) {
        this.animationQueue = this.animationQueue.then(task).catch(() => {});
    }
}