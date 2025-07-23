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
import { capitalize } from "@/helpers/StringHelper";
import { AnimatedPlayer } from "./PlayerClass";

const fullBasePath: Record<string, string[]> = {
    first: ['second', 'third', 'home'],
    second: ['third', 'home'],
    third: ['home'],
};

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

        this.announcer.setMessage(this.eventLog[this.eventIndex-1].message);
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

    getPlayerByName(name: string | undefined) {
        if (!name) return undefined;
        return this.battingTeam?.playersByName[name] ?? this.fieldingTeam?.playersByName[name];
    }

    parseOuts(message: string): { name: string, base: keyof typeof positions }[] {
        const batterName = this.battingTeam?.currentBatter?.name ?? '';
        const outs: { name: string, base: keyof typeof positions }[] = [];

        // All of this is for the weird batting formatting
        const outPatterns = [
            { regex: new RegExp(`${batterName} (lines|flies|pops|grounds) out`, 'i'), base: 'First' },
            { regex: new RegExp(`${batterName} out at (first|second|third|home)`, 'i') },
            { regex: /double play.*out at (first|second|third|home)/gi },
            { regex: /triple play.*out at (first|second|third|home)/gi }
        ];

        for (const pattern of outPatterns) {
            const match = pattern.regex.exec(message);
            if (match) {
                let base = match[1]?.toLowerCase() as string;
                if (pattern.base) base = 'First'; // default for batter if not specified
                const outBase = capitalize(base) as keyof typeof positions;
                outs.push({ name: batterName, base: outBase });
            }
        }

        // XXX out at YYY for base runners
        const runnerOuts = [...message.matchAll(/([\w.'-]+) out at (first|second|third|home)/gi)];
        for (const [, name, base] of runnerOuts) {
            outs.push({
                name,
                base: capitalize(base) as keyof typeof positions
            });
        }

        return outs;
    }

    private async resolvePlay(index: number) {
        const curEvent = this.eventLog[index];
        const nextEvent = this.eventLog[index + 1];
        const curBases = this.baseStates[index].bases;
        const nextBases = this.baseStates[index + 1].bases;
        const outs = this.parseOuts(nextEvent.message);
        const throwChain = this.parseThrowChain(nextEvent.message, this.getHitLocation(curEvent.message));
        const ball = this.createBall(positions['Home']);

        // Okay. I've tried this many times before, but it evidently is not working. So I'll do the age-old whiteboarding/pseudocode/rubber duck/sanity check approach

        /*
        Hello and welcome back to the daily sanity check, starring your host, as always, me! Luna! I named myself after the moon because sometimes I wish I was as removed from the events that take place on Earth as the moon is.
        Today's sanity check is on the meat of this application. How can I line up the ball throws and the base running while still keeping them unique and realistic? I have 12 seconds (two phases) to cover base movement and ball throwing.
        
        I'm working with 9 things to start
        - The Current Event (a 'Pitch')
        - The Next Event (a 'Field')
        - Current Bases
        - Next Bases
        - Outs {name: string, base: string as keyof Bases}
        - ThrowChain: A string array of all the locations the ball must visit, in order
        
        Two options for how we start this. 
        We can either make all the walking animations and then use their lengths to calculate when the ball should be thrown
        Or... We can calculate the ball throws and then use that to find how long the base walks should be.
        In terms of realism, it's likely better to go with the first option. Going with the first option means we always know where the ball will be at a given moment
        We can use our knowledge of the ball's location to make it look like the runners are 'judging' whether they should run or not before they run.
        For example, If a runner advances from first to third throughout the entire play, and we know the ball goes from LF to RF. They can stand on second and not run until the ball is mid-throw to RF.

        So we'll need to start by calculating the throw times. BUT the issue now is assuming the fielders don't always catch the ball. But, actually, it seems that if they don't catch the ball it's considered an error?
        Well if it is an error, we already know MMOLB parses and tells us about those. So we can parse their message and determine who catches the ball and who doesn't, based on if anyone errors.

        Okay, so now we assume a max of 12 seconds for 4 total base runs. We won't ever have someone advance all 4 bases in one hit while there is passing going on, but let's assume we will.
        2s to run to each base
        1s of contemplation
        4 bases
        12 total seconds maximum (not including the pitch, blah blah)
        So ball passes should take probably 2-3 seconds each? With some time after the catch for the catcher to presumably get the ball out of their glove, decide who to pass to next, and then actually make that pass.
        Average base distance is 200px, and we'll say it's about 300-400 for the distance the ball will travel each pitch. So a ball covering 1.5-2x the distance in the same time, plus some down time for getting the ball out of the glove and so on.
        That means the players are running at 100pps, which is the default speed. This math is good and nice and I like it!

        So, let's assume the runners will run before the pass happens that gets them out. Maybe they start running like as the ball hits the air, but then realize too late that they'll get out.
        I'm saying this because it makes it easy to calculate. *where is the ball? lf. where is the ball? lf. where is the ball? in-air (to 2B). okay, now have the first runner think they can make it to second and start sprinting. Oh no, they're out*

        So what will I need to implement this?
        A function that can calculate the time it will take to pass a ball from x to y
        A function that can take a current time, end time, and distance, then calculate the speed the runner should run (tell it the runner should arrive 200ms before or after the ball, etc).
        Distance function (builtin to Vector2. As long as my math there is right)
        some other stuff. I'm not good at writing things out ahead of time

        So that is my daily sanity check. Now to implement what is written here
        */

        const baseToFielder: Record<string, keyof typeof positions> = {
            first: 'FirstBaseman',
            second: 'SecondBaseman',
            third: 'ThirdBaseman',
            home: 'Catcher',
        };

        const fullBasePath: Record<string, string[]> = {
            first: ['second', 'third', 'home'],
            second: ['third', 'home'],
            third: ['home'],
        };

        function computePath(from: string, to: string): string[] {
            const bases = fullBasePath[from];
            const index = bases.indexOf(to);
            if (index === -1) return [capitalize(to)];
            return [capitalize(from), ...bases.slice(0, index + 1).map(b => capitalize(b))];
        }

        function calculateThrowSpeed(from: Vector2, to: Vector2, minTime: number = 1200): number {
            const distance = Vector2.distance(from, to);
            const rawSpeed = distance / (minTime / 1000);
            return rawSpeed;
        }

        function jitteredLocation(originalPos: Vector2, offsets: [number, number, number, number] = [20, 20, 20, 20]): Vector2 {
            const offsetX = Math.random() * (offsets[0] + offsets[1]) - offsets[0];
            const offsetY = Math.random() * (offsets[2] + offsets[3]) - offsets[2];
            return new Vector2(originalPos.x + offsetX, originalPos.y + offsetY);
        }

        const throwSegments: {fromPos: keyof typeof positions; toPos: keyof typeof positions; from: Vector2; to: Vector2; dist: number; speed: number; duration: number; holdTime: number;}[] = [];
        for (let i = 1; i < throwChain.length; i++) {
            const fromPos = throwChain[i-1];
            const toPos = throwChain[i];
            const from = throwSegments[i-2]?.to ?? positions[fromPos];
            let to = jitteredLocation(positions[toPos]);
            let speed: number = 100;
            if (fromPos === 'Home') {
                if (curEvent.message.includes('lines'))
                    speed = calculateThrowSpeed(from, to, 600 + Math.random() * 100);
                else if (curEvent.message.includes('grounds')){
                    speed = calculateThrowSpeed(from, to, 700 + Math.random() * 200);
                    to = jitteredLocation(positions[toPos], [20, 20, 20, 0]); // Don't go behind the catcher
                }
                else if (curEvent.message.includes('flies'))
                    speed = calculateThrowSpeed(from, to, 800 + Math.random() * 300);
                else
                    speed = calculateThrowSpeed(from, to, 1000 + Math.random() * 400);
            } else {
                speed = calculateThrowSpeed(from, to, 1000 + Math.random() * 400);
            }
            const dist = Vector2.distance(from, to);
            const duration = (dist / speed) * 1000;
            const holdTime = 350 + Math.random() * 200;
            throwSegments.push({fromPos, toPos, from, to, dist, speed, duration, holdTime});
        }

        let cumulativeTime = 0;
        const throwTimeline = throwSegments.map(seg => {
            const start = cumulativeTime;
            const catchTime = cumulativeTime + seg.duration;
            const end = catchTime + seg.holdTime;
            cumulativeTime = end
            return {...seg, start, end};
        })

        const playerPaths: {player: string; basePath: string[]; isOut: boolean;}[] = [];
        for (const base of ['first', 'second', 'third'] as const) {
            const curPlayer = curBases[base];
            if (!curPlayer) continue;

            const newBase = Object.entries(nextBases).find(([_, baseman]) => baseman === curPlayer)?.[0] ?? null;
            const isOut = outs.some(o => o.name === curPlayer);
            let path: string[] = [];

            if (isOut) {
                const outBase = outs.find(o => o.name === curPlayer)!.base;
                path = computePath(base, outBase.toLowerCase());
            } else if (newBase) {
                path = computePath(base, newBase);
            } else {
                path = computePath(base, 'home'); // Assume they scored I guess? They aren't out and also aren't on a base
            }

            playerPaths.push({player: curPlayer, basePath: path, isOut});
        }

        const runnerTimings: {player: string; path: string[]; startTimes: number[]; speeds: number[];}[] = [];
        for (const {player, basePath, isOut} of playerPaths) {
            const timings: number[] = [];
            const speeds: number[] = [];

            if (isOut) {
                const finalBase = basePath[basePath.length - 1].toLowerCase();
                const fielder = baseToFielder[finalBase];
                const throwEvent = throwTimeline.find(({ toPos }) => toPos === fielder);
                const outTime = throwEvent ? throwEvent.end : cumulativeTime;
                const totalDist = 200 * basePath.length;
                const speed = totalDist / (outTime/1000);
                const clampedSpeed = Math.min(speed, 150);
                const baseDuration = 200 / clampedSpeed*1000;
                for (let i = 0; i < basePath.length; i++) {
                    timings.push(i * baseDuration);
                    speeds.push(clampedSpeed);
                }
            } else {
                const totalDist = basePath.length * 200;
                const totalTime = 800 + basePath.length * 1600;
                const speed = totalDist / (totalTime / 1000);
                const baseDuration = 200 / speed * 1000;
                for (let i = 0; i < basePath.length; i++) {
                    timings.push(i * baseDuration);
                    speeds.push(speed);
                }
            }

            runnerTimings.push({ player, path: basePath, startTimes: timings, speeds });
        }

        console.log(throwSegments);
        console.log(outs);
        for (const pass of throwSegments) {
            const catcher = this.fieldingTeam?.playersByPosition[pass.toPos];
            catcher?.walkTo(pass.to);

            const matchedOut = outs.find(out => baseToFielder[out.base.toLowerCase()] === pass.toPos);
            if (matchedOut) {
                const basePos = positions[matchedOut.base];
                const walkDistance = Vector2.distance(catcher!.posVector, basePos);
                const speed = 125;
                const calcDuration = walkDistance / speed;
                const calcPassDuration = (pass.duration+pass.holdTime)-calcDuration;
                const calcPassSpeed = pass.dist / (calcPassDuration/1000);
                await ball.throwTo(pass.to, calcPassSpeed);
                ball.moveTo(basePos, speed);
                await catcher!.walkTo(basePos, speed);
            }       
            else {
                await ball.throwTo(pass.to, pass.speed);
                await this.sleep(pass.holdTime);
            }
            catcher?.returnToPosition();
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
                if (next?.event === 'Field') this.resolvePlay(cur.index);
                else {
                    if (cur.message.includes('steals')) this.advanceBases(cur.index);
                    const ball = this.createBall(positions['Pitcher']);
                    await ball.throwTo(positions['Home']);
                    this.svgRef.current?.removeChild(ball.group);
                    if (cur.message.includes('Foul')) this.foulBallAnimation(this.battingTeam.currentBatter?.posVector === positions['LeftHandedBatter'] ? 'L' : 'R');
                    // if (cur.message.includes('hits')) {
                    //     this.processHitBall(cur.index);
                    //     this.advanceBases(next?.index ?? 0);
                    // }
                }
            }
        }

        // Default message shows on page load
        this.announcer.sayMessage({text: cur.message ?? "Howdy! If you're on mobile, this page is fully intended to be viewed in landscape mode. Report any bugs in the offical MMOLB Discord please.", duration: 4000});
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private runParallel(tasks: (() => Promise<void>)[]): Promise<void> {
        return Promise.all(tasks.map(task => task().catch(() => {}))).then(() => {});    
    }

    private queue(task: () => Promise<void>) {
        this.animationQueue = this.animationQueue.then(task).catch(() => {});
    }
}