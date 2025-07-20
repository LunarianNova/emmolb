// Author: Luna
// This is the biggest MMOLB project I've handled

'use client'
import { Bases } from "@/types/Bases";
import { Event } from "@/types/Event";
import { Game } from "@/types/Game";
import { Team } from "@/types/Team";
import { ProcessMessage } from "./BaseParser";
import { RefObject, useEffect, useRef, useState } from "react";
import Loading from "./Loading";
import { getContrastTextColor } from "@/helpers/Colors";

/* 
Timings

There are three phases to each PA
 - A "Pitch" phase, which involves the ball being pitched, and comes with the outcome
 - A "Field" phase, that plays if the ball was a valid hit
 - A "BatterSwap" phase, that plays after a field phase, on a walk, or on a SO

A new event is retrieved every 6 seconds regardless of its "phase"
So the question becomes: How can we make a 6 second pitch as interactive and engaging as a 6 second field?
Here is my concept -

Pitch:
0-1.5s: Nothing. This is a place to display text from last event or to say "Winding up..."
1.5-2.8s: The actual pitch. This can be +- .2s based on speed (80-120mph)
2.8-4s: Build suspense. Have the ball stop or disappear and say "A swing..." or "No swing..."
4-5.5s: Display "And..." to build more suspense
5.5-6s: Display the result, "Out!" "Strike!" "Ball!" "Foul!" "Walk!" and so on
* Timings will need to be worked on. This one is awfully hard to keep engaging over 6 seconds

Field:
0-1.5s: The first resolution. Display the ball moving from the bat to its destination and the fielder either catching or not
1.5-3.0s: Second resolution. The ball gets its first throw, and the runners move a second base if applicable
3.0-4.5s: Third resolution. The above but again
4.5-6.0s: This is a slot for Homers or Grand Slams to run their fourth base. Otherwise this slot can be used to throw the ball back to mound on a triple
* The ball can get thrown back in its respective slot, after all needed resolutions
* Have some variance in timing so it isn't so stiff. This includes runners moving at different speeds
* Calculate what bases the ball needs to reach and when. Then if a runner gets out there, make sure they arrive *after* the ball.

BatterSwap:
0-3s: Current batter (if there is one) walks to dugout, Or if it is a walk, they can walk to their base
3-6s: New batter walks out from dugout
* This is probably the most boring, but that is fine as it doesn't play often
*/

/*
What will I need?

I will need a diamond svg to display on the background. As filler we can use the blobile one which is already programmed and just remove the text from it
I will need to calculate a GameState on every event. It will include the event and its index, as well as whether balls increased, strikes increased, etc
Functions for each animation, and then a big if else (: to determine which to play
An animation timer (or tick) which calls a state update every frame to ensure the animations are playing smoothly
A function that is called every 6 seconds which adds one to the current event index, and if the game is live, polls for new events
* If the game is live, keep a three event buffer in case events aren't fetched. This keeps it running smoothly the whole way
If the game is over, instead display the event number and have pause/play and skip buttons to scrub through the game or rewatch it
I will need somewhere to display the events. I will need to show the text from the event, the current ball/strike/out count, and the teams with their score
* Also it will need inning info
The display function should take in the past, current, and future GameState. It will animate the current state, show the message from the past, and maybe use the future for checks (fielding)
I can have an object that stores all player positions at the current time. In case I want to display text above a player as they move
I'll need hardcoded locations for all players to default to
Randomize the position of the ball when thrown to make it feel more realistic
An object that holds all animations that need to play. Then I can just check if they're true or not

* Determine whether I should use smoothlerp or just lerp
* Look into locking fps at 60?
* Speed modifiers for rewatching??
*/

type Coords = {
    x: number;
    y: number;
    rotation?: number;
    scale?: number;
    opacity?: number;
};

type AnimationKeyFrameBase = {
    id: string;
    startTime: number;
    endTime: number;
    from: Partial<Coords>;
    to: Partial<Coords>;
    fill: string;
    stroke: string;
    easing?: (t: number) => number;
    lifetime?: number;
};

type MoveKeyFrame = AnimationKeyFrameBase & {
    type: "Move";
};

type HoldKeyFrame = AnimationKeyFrameBase & {
    type: "Hold";
};

type TextKeyFrame = AnimationKeyFrameBase & {
    type: "Text";
    text: string;
    fontSize: number;
};

type HoldTextKeyFrame = AnimationKeyFrameBase & {
    type: "HoldText";
    text: string;
    fontSize: number;
};

type AnimationKeyFrame = | MoveKeyFrame | HoldKeyFrame | TextKeyFrame | HoldTextKeyFrame;

type GameState = {
    index: number;
    event: Event;
    homeName: string;
    awayName: string;
    homeColor: string;
    awayColor: string;
    isGameOver: boolean;
    pitchSpeed?: number;
    bases: Bases;
    ballsIncreased: boolean;
    strikesIncreased: boolean;
    outsIncreased: boolean;
    baseQueue: string[];
    phase: Phase;
};

const Phases = {
    Pitch: "Pitch",
    Field: "Field",
    NowBatting: "NowBatting",
    InningEnd: "InningEnd",
    InningStart: "InningStart",
    Other: "Other"
};

type Phase = keyof typeof Phases;

// Trial and error :(
const positions: Record<string, [number, number]> = {
    "LeftFielder": [100, 120],
    "CenterFielder": [328, 45],
    "RightFielder": [556, 120],
    "FirstBase": [450, 300],
    "SecondBase": [400, 200],
    "Shortstop": [256, 200],
    "ThirdBase": [206, 300],
    "Pitcher": [328.5, 320],
    "Home": [327.8, 428],
    "Catcher": [327.8, 470],
    "BatterLeft": [307, 428],
    "BatterRight": [347.5, 428],
    "FirstRunner": [443, 315],
    "SecondRunner": [328.5, 200],
    "ThirdRunner": [212, 315],
    "HomeDugout": [475, 400],
    "AwayDugout": [175, 400],
};

const fielderLabels: Record<string, string> = {
    "CenterFielder": "CF",
    "LeftFielder": "LF",
    "RightFielder": "RF",
    "FirstBase": "1B",
    "SecondBase": "2B",
    "Shortstop": "SS",
    "ThirdBase": "3B",
    "Pitcher": "P"
};

const inverseFielderLabels: Record<string, string> = {
    "CF": "CenterFielder",
    "LF": "LeftFielder",
    "RF": "RightFielder",
    "1B": "FirstBase",
    "2B": "SecondBase",
    "SS": "Shortstop",
    "3B": "ThirdBase",
    "P": "Pitcher"
};

const baseFromFielder: Record<string, string> = {
    "FirstBase": "FirstRunner",
    "SecondBase": "SecondRunner",
    "ThirdBase": "ThirdRunner",
    "Home": "Home",
}

const basePath = ["FirstRunner", "SecondRunner", "ThirdRunner", "Home"];

// Pain
function getPhase(event: Event): Phase {
    switch (event.event) {
        case "Pitch": return "Pitch";
        case "Field": return "Field";
        case "NowBatting": return "NowBatting";
        case "InningEnd": return "InningEnd";
        case "InningStart": return "InningStart";
        default: return "Other";
    }
};

function interpolate(a: number, b: number, t: number): number {
    return a + (b - a) * t;
};

function createMoveKeyFrame(id: string, from: Coords, to: Coords, startTime: number, duration: number, fill: string = "white", stroke: string="black", lifetime?: number): MoveKeyFrame {
    return {
        id,
        type: "Move",
        startTime,
        endTime: startTime + duration,
        from,
        to,
        stroke,
        fill,
        lifetime
    }
}

function createHoldKeyFrame(id: string, coords: Coords, startTime: number, duration: number, fill: string = "white", stroke: string="black", lifetime?: number): HoldKeyFrame {
    return {
        id,
        type: "Hold",
        startTime,
        endTime: startTime + duration,
        from: coords,
        to: coords,
        stroke,
        fill,
        lifetime,
    }
}

function createTextKeyFrame(id: string, from: Coords, to: Coords, startTime: number, duration: number, text: string, fill: string = "black", stroke: string="none", fontSize: number=12, lifetime?: number): TextKeyFrame {
    return {
        id,
        type: "Text",
        startTime,
        endTime: startTime + duration,
        from,
        to,
        text,
        stroke,
        fill,
        fontSize,
        lifetime,
    }
}

function createHoldTextKeyFrame(id: string, coords: Coords, startTime: number, duration: number, text: string, fill: string = "black", stroke: string="none", fontSize: number=12, lifetime?: number): HoldTextKeyFrame {
    return {
        id,
        type: "HoldText",
        startTime,
        endTime: startTime + duration,
        from: coords,
        to: coords,
        text,
        stroke,
        fill,
        fontSize,
        lifetime,
    }
} 

function intializeScene(frames: AnimationKeyFrame[]) {
    const seenIDs = new Set<string>;

    for (const frame of frames) {
        if (seenIDs.has(frame.id)) continue;
        seenIDs.add(frame.id);

        const existing = document.getElementById(frame.id);
        if (existing) continue;

        let el: SVGElement;

        if (frame.type === "HoldText" || frame.type === "Text") {
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.setAttribute('id', frame.id);
            group.setAttribute("transform", `translate(0, 0)`);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            console.log(text instanceof SVGTextElement);
            text.textContent = frame.text;
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("fill", frame.fill || "white");
            text.setAttribute("stroke", frame.stroke || "none");
            text.setAttribute("opacity", "0"); // Start hidden
            text.setAttribute("font-size", String(frame.fontSize));

            group.appendChild(text);
            
            el = group;
        } else {
            // Assume circle. Can code other stuff into the frame or as a check here later
            const obj = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            obj.setAttribute("id", frame.id);
            obj.setAttribute("r", "6");
            obj.setAttribute("fill", frame.fill);
            obj.setAttribute("stroke", frame.stroke);
            obj.setAttribute("opacity", "0");
            el = obj;
        }

        const start = frame.from;
        const x = start.x ?? 0;
        const y = start.y ?? 0;
        const r = start.rotation ?? 0;
        const s = start.scale ?? 1;

        el.setAttribute("transform", `translate(${x}, ${y}) rotate(${r}) scale(${s})`);
        const svg = document.getElementById("scene");
        if (svg) svg.appendChild(el);
    }
}

function applyAnimations(frames: AnimationKeyFrame[], time: number) {
    for (let i = frames.length - 1; i >= 0; i--) {
        const frame = frames[i];

        if (frame.lifetime && time > frame.lifetime) {
            destroyElement(frame.id);
            frames.splice(i, 1);
            continue;
        }

        if (time < frame.startTime || time > frame.endTime) continue;

        switch (frame.type) {
            case "Move":
            case "Hold":
                applyMove(frame, time);
                break;
            case "Text":
            case "HoldText":
                applyText(frame, time);
                break;
        }
    }
}

function applyMove(frame: AnimationKeyFrame, time: number) {
    const t = (time - frame.startTime) / (frame.endTime - frame.startTime);
    const progress = frame.easing ? frame.easing(t) : t;

    const x = lerp(frame.from.x ?? 0, frame.to.x ?? 0, progress);
    const y = lerp(frame.from.y ?? 0, frame.to.y ?? 0, progress);
    const r = lerp(frame.from.rotation ?? 0, frame.to.rotation ?? 0, progress);
    const s = lerp(frame.from.scale ?? 1, frame.to.scale ?? 1, progress);
    const o = lerp(frame.from.opacity ?? 1, frame.to.opacity ?? 1, progress);

    const el = document.getElementById(frame.id);
    if (!el) return;

    el.setAttribute("transform", `translate(${x}, ${y}) rotate(${r}) scale(${s})`);
    el.setAttribute("opacity", o.toString())
}

function applyText(frame: TextKeyFrame | HoldTextKeyFrame, time: number) {
    const t = (time - frame.startTime) / (frame.endTime - frame.startTime);
    const progress = frame.easing ? frame.easing(t) : t;

    const x = lerp(frame.from.x ?? 0, frame.to.x ?? 0, progress);
    const y = lerp(frame.from.y ?? 0, frame.to.y ?? 0, progress);
    const r = lerp(frame.from.rotation ?? 0, frame.to.rotation ?? 0, progress);
    const s = lerp(frame.from.scale ?? 1, frame.to.scale ?? 1, progress);
    const o = lerp(frame.from.opacity ?? 1, frame.to.opacity ?? 1, progress);

    const el = document.getElementById(frame.id);
    if (!el) return;
    const text = el.querySelector('text');
    if (!text) return;

    text.textContent = frame.text;
    el.setAttribute("transform", `translate(${x}, ${y}) rotate(${r}) scale(${s})`);
    text.setAttribute("opacity", o.toString())
}

function getTeamInitials(team: Team) {
  if (!team) return "";

  const locationInitial = team.location ? team.location.charAt(0) : "";

  // Split Name by spaces, filter out empty strings, take first letter of each word
  const nameInitials = team.name ? team.name.split(" ").filter(Boolean).map((word: string) => word.charAt(0)).join("") : "";
  
  return locationInitial + nameInitials;
}

function getGameState(gameState: GameState, event: Event, players: string[],): GameState {
    const { bases, baseQueue } = ProcessMessage(event, players, gameState.baseQueue);

    return {
        ...gameState,
        index: event.index,
        event: event,
        homeName: gameState.homeName,
        awayName: gameState.awayName,
        homeColor: gameState.homeColor,
        awayColor: gameState.awayColor,
        isGameOver: event.event === "RecordKeeping" || event.message.includes('Final score:'),
        pitchSpeed: parseFloat(event.pitch_info?.split(" ")[0] ?? "") || undefined,
        bases: bases,
        baseQueue: baseQueue,
        ballsIncreased: (gameState.event.balls ?? 0) < (event.balls ?? 0),
        strikesIncreased: (gameState.event.strikes ?? 0) < (event.strikes ?? 0),
        outsIncreased: ((gameState.event.outs ?? 0) < (event.outs ?? 0) || (gameState.event.outs === 2 && !event.outs)),
        phase: getPhase(event),
    }
}

function lerp(a: number, b: number, t: number) {
    return a + (b-a) * t;
}

function generateResetFielders(isHome: boolean, cur: GameState, start: number = 0): AnimationKeyFrame[] {
    const animations = [...Object.values(inverseFielderLabels).flatMap((p, i) => {
        const pos = {x: positions[p][0], y: positions[p][1]};
        const textPos = {x: pos.x, y: pos.y - 20};
        const fill = isHome ? `#${cur.homeColor}` : `#${cur.awayColor}`;
        const stroke = getContrastTextColor(isHome ? cur.homeColor : cur.awayColor)

        const move = createHoldKeyFrame(p, pos, start, 100, fill, stroke);
        const moveText = createHoldTextKeyFrame(`${p}-text`, textPos, start, 100, p !== "Pitcher" ? fielderLabels[p] : cur.event.pitcher ?? 'P', "black", "none")
        return [move, moveText];
    })]
    return animations
}

function killObject(id: string, start: number, type: 'Text' | 'Object') {
    switch (type) {
        case "Text":
            return createHoldKeyFrame(id, {x: 0, y: 0, opacity: 0, scale: 0}, start, 200);
        case "Object":
            return createHoldTextKeyFrame(id, {x: 0, y: 0, opacity: 0}, start, 200, '');
    }
}

function destroyElement(id: string) {
    const el = document.getElementById(id);
    if (el) {
        el.remove();
    } else {
        console.warn(`Element with id '${id}' not found.`);
    }
}

function reassignId(oldId: string, newId: string) {
    const el = document.getElementById(oldId);
    if (!el) {
        console.warn(`Element with id '${oldId}' not found.`);
        return;
    }

    // Avoid ID collision
    if (document.getElementById(newId)) {
        console.warn(`Element with id '${newId}' already exists.`);
        return;
    }

    el.setAttribute("id", newId);
}

function garbageCollection(prev: AnimationKeyFrame[], current: AnimationKeyFrame[]): AnimationKeyFrame[] {
    const seenIDs = new Set<string>();
    let animations: AnimationKeyFrame[] = [];

    for (const animation of current)
        if (!seenIDs.has(animation.id)) seenIDs.add(animation.id);
    for (const animation of prev)
        if (!seenIDs.has(animation.id)) animations.push(createHoldKeyFrame(animation.id, {x: 0, y:0}, 0, 0, "black", "black", 0));

    return animations;
}

function foulBallAnimation(hand: "R" | "L"): AnimationKeyFrame {
    const foulBounds: Record<string, [number, number]> = {
        "R": [660,150],
        "L": [-10,150],
    }

    // 65% chance to hit to dominant side
    let side: string = '';
    if (Math.random() > .35) {
        side = hand;
    } else {
        side = hand === "R" ? "L" : "R";
    }

    const duration = 1500 + Math.random() * 300; // 1.5-1.8s
    const offset = Math.random()*100; // Some randomness in y position
    const fromPos = {x: positions["Home"][0], y: positions["Home"][1], rotation: 0};
    const toPos = {x: foulBounds[side][0], y: foulBounds[side][1] + offset, rotation: 1080};

    reassignId('Ball', 'OldBall');
    return createMoveKeyFrame('OldBall', fromPos, toPos, 0, duration, "red", "white", duration);
}

function jitterPosition(position: [number, number], randomness: number = 25): [number, number] {
    return [position[0] + (Math.random()*randomness*2)-(randomness), position[1] + (Math.random()*randomness*2)-(randomness)];
}

// For positions keys
function positionToXY(posName: keyof typeof positions): {x: number, y: number,} {
    const [x, y] = positions[posName];
    return { x, y };
}

function offsetText(pos: {x: number, y: number,}) {
    return {x: pos.x, y: pos.y - 20,};
}

function toVec(arr: [number, number]) {
    return {x: arr[0], y: arr[1],};
}

function getHitLocation(msg: string): keyof typeof positions {
    if (msg.includes("to center field")) return "CenterFielder";
    if (msg.includes("to left field")) return "LeftFielder";
    if (msg.includes("to right field")) return "RightFielder";
    if (msg.includes("to first base")) return "FirstBase";
    if (msg.includes("to second base")) return "SecondBase";
    if (msg.includes("to third base")) return "ThirdBase";
    if (msg.includes("to the shortstop")) return "Shortstop";
    return "Home";
}

function parseThrowChain(msg: string, start: keyof typeof positions): (keyof typeof positions)[] {
    const chain: (keyof typeof positions)[] = ["Home", start];
    const [, throwPart] = msg.split(",", 2);
    const matches = [...(throwPart?.matchAll(/\b([1-3][B]|SS|[LRC]F)\b/g) ?? [])].slice(1); // Remove the duplicate 'start' position
    for (const match of matches) {
        const pos = inverseFielderLabels[match[1]];
        if (pos) chain.push(pos); // Only add defined ones
    }
    return chain;
}

function createRunnerAnimations(prev: GameState, cur: GameState, throwChain: (keyof typeof positions)[], throwTimes: number[], totalThrowTime: number, isHome: boolean, name: string, out: boolean, outBase?: keyof typeof positions): AnimationKeyFrame[] {
    if (out && !outBase) return [];
    const animations: AnimationKeyFrame[] = [];

    // Get positions from name
    let startBase: keyof typeof positions = 'Home';
    if (prev.bases.first === name) startBase = 'FirstRunner';
    else if (prev.bases.second === name) startBase = 'SecondRunner';
    else if (prev.bases.third === name) startBase = 'ThirdRunner';

    let endBase: keyof typeof positions = 'Home'
    if (!out) {
        if (cur.bases.first === name) endBase = 'FirstRunner';
        else if (cur.bases.second === name) endBase = 'SecondRunner';
        else if (cur.bases.third === name) endBase = 'ThirdRunner';
    }
    if (out) {
        endBase = outBase!;
    }

    const runStartDelay = 200 + Math.random() * 200; // Simulate reaction time
    const safetyBuffer = 200 + Math.random() * 200; // How long the ball should arrive before/after them
    const runnerTotalTime = totalThrowTime + (out ? safetyBuffer : -safetyBuffer); // Arrive after if safe

    if (out) {
        const lastFielder = throwChain[throwChain.length - 1];
        endBase = baseFromFielder[lastFielder]; // Convert field location to the base
    }

    const startIndex = basePath.indexOf(startBase);
    const endIndex = basePath.indexOf(endBase);
    const runnerPath = basePath.slice(startIndex, endIndex + 1);
    const segmentTime = runnerTotalTime / runnerPath.length; // Currently runs at an even pace. Change this later?

    let runTime = runStartDelay;

    // Generate each base to base
    for (let i = 0; i < runnerPath.length; i++) {
        const from = i === 0 ? positions[startBase] : positions[runnerPath[i - 1]];
        const to = positions[runnerPath[i]];

        animations.push(createMoveKeyFrame(startBase, toVec(from), toVec(to), runTime, segmentTime));
        animations.push(createTextKeyFrame(`${startBase}-text`, offsetText(toVec(from)), offsetText(toVec(to)), runTime, segmentTime, name));
        runTime += segmentTime;
    }

    const endPos = positionToXY(endBase)

    if (out) {
        // Out text
        animations.push(createTextKeyFrame("OutMarker", endPos, offsetText(endPos), runTime, 500, "OUT!", "red", "red", 20));
        animations.push(killObject("OutMarker", runTime + 1000, "Text"));

        // Walk of shame
        const dugout = isHome ? positions["AwayDugout"] : positions["HomeDugout"];
        animations.push(createMoveKeyFrame(startBase, endPos, toVec(dugout), runTime + 400, 1200));
        animations.push(createTextKeyFrame(`${startBase}-text`, offsetText(endPos), offsetText(toVec(dugout)), runTime + 400, 1200, prev.event.batter ?? ''));
    } else {
        animations.push(createTextKeyFrame("SafeMarker", endPos, offsetText(endPos), runTime, 500, "SAFE!", "red", "red", 20));
        animations.push(killObject("SafeMarker", runTime + 1000, "Text"));
    }

    return animations;
}

function generateInningStartAnimations(prev: GameState, cur: GameState, next: GameState, isHome: boolean): AnimationKeyFrame[] {
    const dugout = isHome ? "HomeDugout" : "AwayDugout";
    return [
        ...generateResetFielders(isHome, cur, 3000), 
        ...Object.values(inverseFielderLabels).flatMap((p, i) => {
            const fromPos = positionToXY(dugout);
            const toPos = positionToXY(p);
            const fill = `#${isHome ? cur.homeColor : cur.awayColor}`;
            const stroke = getContrastTextColor(isHome ? cur.homeColor : cur.awayColor);
            return [
                createMoveKeyFrame(p, fromPos, toPos, 0, 3000, fill, stroke), 
                createTextKeyFrame(`${p}-text`, offsetText(fromPos), offsetText(toPos), 0, 3000, p !== "Pitcher" ? fielderLabels[p] : next.event.pitcher ?? 'P'),
            ];
        })
    ];
}

function generateInningEndAnimations(prev: GameState, cur: GameState, next: GameState, isHome: boolean): AnimationKeyFrame[] {
    const dugout = isHome ? "HomeDugout" : "AwayDugout";
    return [
        ...Object.values(inverseFielderLabels).flatMap((p, i) => {
            const toPos = positionToXY(dugout)
            const fromPos = positionToXY(p);
            const fill = `#${isHome ? cur.homeColor : cur.awayColor}`;
            const stroke = getContrastTextColor(isHome ? cur.homeColor : cur.awayColor);

            const move = createMoveKeyFrame(p, fromPos, toPos, 0, 3000, fill, stroke);
            const moveText = createTextKeyFrame(`${p}-text`, offsetText(fromPos), offsetText(toPos), 0, 3000, p !== "Pitcher" ? fielderLabels[p] : cur.event.pitcher ?? 'P');

            const killPlayer = killObject(p, 3300, "Object");
            const killText = killObject(`${p}-text`, 3300, "Text");

            return [move, moveText, killPlayer, killText];
        })  
    ];
}

function generatePitchAnimations(prev: GameState, cur: GameState, next: GameState, isHome: boolean): AnimationKeyFrame[] {
    const animations = generateResetFielders(isHome, cur);

    const speed = Math.min(120, Math.max(cur.pitchSpeed ?? 80, 80))
    const duration = 1300 + ((100-speed)*10); // 1.3s +- .2s
    const fromPos = {x: positions["Pitcher"][0], y: positions["Pitcher"][1], rotation: 0};
    const toPos = {x: positions["Home"][0], y: positions["Home"][1], rotation: 1080};
    const resultLocation = {x: toPos.x, y: toPos.y - 40};
    const swingText = (cur.ballsIncreased || cur.strikesIncreased && cur.event.message.includes("looking")) ? "No Swing..." : "A Swing..."
    let resultText = '';

    if (cur.strikesIncreased)
        resultText = cur.event.message.includes('Foul') ? "FOUL!" : "STRIKE!";
    else if (cur.ballsIncreased)
        resultText = "BALL!";
    else if (cur.outsIncreased)
        resultText = "STRIKEOUT!";
    else if (cur.event.message.includes('hit by pitch'))
        resultText = "HBP!";

    if (prev.event.message.includes('Foul'))
        animations.push(foulBallAnimation("R"));
    animations.push(createHoldTextKeyFrame('Ball', fromPos, 700, 800, "⚾", "red", "white"));
    animations.push(createTextKeyFrame('Ball', fromPos, toPos, 1500, duration, "⚾", "red", "white"));
    animations.push(createHoldTextKeyFrame('SwingText', resultLocation, 1500+duration, 4000-(1500+duration), swingText, "white", "white", 20));
    animations.push(createHoldTextKeyFrame('SwingText', resultLocation, 4000, 1500, "And...", "white", "white", 20));
    animations.push(createHoldTextKeyFrame('SwingText', resultLocation, 5500, 500, resultText, "white", "white", 20));

    return animations;
}

function generateNowBattingAnimations(prev: GameState, cur: GameState, next: GameState, isHome: boolean): AnimationKeyFrame[] {
    const dugout = isHome ? positions["AwayDugout"] : positions["HomeDugout"];
    const fill = isHome ? `#${cur.awayColor}` : `#${cur.homeColor}`;
    const stroke = getContrastTextColor(isHome ? cur.awayColor : cur.homeColor);

    const animations = generateResetFielders(isHome, cur);
    if (prev.event.message.includes('struck out')){
        reassignId('Batter', 'OldBatter');
        reassignId('Batter-text', 'OldBatter-text');
        animations.push(createMoveKeyFrame('OldBatter', {x: positions["BatterLeft"][0], y: positions["BatterLeft"][1]}, {x: dugout[0], y: dugout[1]}, 0, 2500, fill, stroke, 2700));
        animations.push(createTextKeyFrame('OldBatter-text', {x: positions["BatterLeft"][0], y: positions["BatterLeft"][1]-20}, {x: dugout[0], y: dugout[1]-20}, 0, 2500, prev.event.batter ?? 'Batter', "black", "none", 12, 2700));
    }
    animations.push(createMoveKeyFrame('Batter', {x: dugout[0], y: dugout[1]}, {x: positions["BatterLeft"][0], y: positions["BatterLeft"][1]}, 0, 2500, fill, stroke));
    animations.push(createTextKeyFrame('Batter-text', {x: dugout[0], y: dugout[1]-20}, {x: positions["BatterLeft"][0], y: positions["BatterLeft"][1]-20}, 0, 2500, next.event.batter ?? 'Batter', "black", "none"));

    return animations;
}

function generateFieldingAnimations(prev: GameState, cur: GameState, next: GameState, isHome: boolean): AnimationKeyFrame[] {
    const animations: AnimationKeyFrame[] = [];

    const hitLocation = getHitLocation(prev.event.message); // Positions-friendly key of the ball's first destination
    const throwChain = parseThrowChain(cur.event.message, hitLocation); // Get the order in which ball moves (["Home", "Shortstop", "FirstBase"])
    const throwTimes = Array(throwChain.length - 1).fill(0).map(() => 1000 + Math.random() * 500); // 1-1.5s per throw
    const throwPositions = throwChain.map(loc => jitterPosition(positions[loc])); // Slightly randomize the ball around its location
    const totalThrowTime = throwTimes.reduce((a, b) => a + b, 0);

    // Map bases keys to 2D positions
    const baseKeyMap: Record<'first'|'second'|'third', keyof typeof positions> = {
        first: 'FirstRunner',
        second: 'SecondRunner',
        third: 'ThirdRunner',
    };

    // Parse message to find where people got out. Assumes 'XXXX out at YYYYY
    function parseOuts(message: string): {name: string, base: keyof typeof positions}[] {
        const outs: {name: string, base: keyof typeof positions}[] = [];

        const regex = /([\w\s'.-]+?) out at (\w+)/gi;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(message)) !== null) { // We love the walrus operator
            const [_, rawName, rawBase] = match;
            const name = rawName.trim();
            const baseName = rawBase.trim().toLowerCase();

            let base: keyof typeof positions = "Home";
            if (baseName.startsWith('first')) base = 'FirstRunner';
            else if (baseName.startsWith('second')) base = 'SecondRunner';
            else if (baseName.startsWith('third')) base = 'ThirdRunner';
            outs.push({ name, base });
        }
        return outs;
    }

    const outs = parseOuts(cur.event.message);

    (['first', 'second', 'third'] as const).forEach(base => {
        const prevName = prev.bases[base];
        const curName = cur.bases[base];
        if (prevName && prevName !== cur.bases[base]) {
            const isOut = outs.some(out => out.name === prevName); // some runs this code like map, and returns a boolean
            const outBase = outs.find(out => out.name === prevName)?.base;
            animations.push(...createRunnerAnimations(prev, cur, throwChain, throwTimes, totalThrowTime, isHome, prevName, isOut, outBase));
        }
    });

    // Batter separate
    const batterName = prev.event.batter ?? '';
    const batterOut = outs.some(out => out.name === batterName);
    const batterOutBase = outs.find(out => out.name === batterName)?.base ?? 'FirstRunner';
    animations.push(...createRunnerAnimations(prev, cur, throwChain, throwTimes, totalThrowTime, isHome, batterName, batterOut, batterOut ? batterOutBase : 'Home'));

    return animations;
}

function compileAnimationsFromGameState(prev: GameState, cur: GameState, next: GameState): AnimationKeyFrame[] {
    const isHome = cur.event.inning_side === 0;

    switch (cur.phase) {
        case 'InningStart':
            return generateInningStartAnimations(prev, cur, next, isHome);
        case 'InningEnd':
            return generateInningEndAnimations(prev, cur, next, isHome);
        case 'Pitch':
            return generatePitchAnimations(prev, cur, next, isHome);
        case 'NowBatting':
            return generateNowBattingAnimations(prev, cur, next, isHome);
        case 'Field':
            return generateFieldingAnimations(prev, cur, next, isHome);
        default:
            return [];
    }
}

// function compileAnimationsFromGameState(prev: GameState, cur: GameState, next: GameState) {
//     let animations: AnimationKeyFrame[] = [];
//     const isHome = cur.event.inning_side === 0

//     if (cur.phase === 'InningStart') {
//         const dugout = isHome ? "HomeDugout" : "AwayDugout";
//         animations = [...generateResetFielders(isHome, cur, 3000), ...Object.values(inverseFielderLabels).flatMap((p, i) => {
//             const fromPos = {x: positions[dugout][0], y: positions[dugout][1]};
//             const toPos = {x: positions[p][0], y: positions[p][1]};
//             const textFrom = {x: fromPos.x, y: fromPos.y - 20};
//             const textTo = {x: toPos.x, y: toPos.y - 20};
//             const fill = `#${isHome ? cur.homeColor : cur.awayColor}`
//             const stroke = getContrastTextColor(isHome ? cur.homeColor : cur.awayColor);

//             const move = createMoveKeyFrame(p, fromPos, toPos, 0, 3000, fill, stroke);
//             const moveText = createTextKeyFrame(`${p}-text`, textFrom, textTo, 0, 3000, p !== "Pitcher" ? fielderLabels[p] : next.event.pitcher ?? 'P', "black", "none");
//             return [move, moveText];
//         })];
//     } else if (cur.phase === 'InningEnd') {
//         const dugout = isHome ? "HomeDugout" : "AwayDugout";
//         animations = [...Object.values(inverseFielderLabels).flatMap((p, i) => {
//             const toPos = {x: positions[dugout][0], y: positions[dugout][1]};
//             const fromPos = {x: positions[p][0], y: positions[p][1]};
//             const textFrom = {x: fromPos.x, y: fromPos.y - 20};
//             const textTo = {x: toPos.x, y: toPos.y - 20};
//             const fill = isHome ? `#${cur.homeColor}` : `#${cur.awayColor}`;
//             const stroke = getContrastTextColor(isHome ? cur.homeColor : cur.awayColor);

//             const move = createMoveKeyFrame(p, fromPos, toPos, 0, 3000, fill, stroke);
//             const moveText = createTextKeyFrame(`${p}-text`, textFrom, textTo, 0, 3000, p !== "Pitcher" ? fielderLabels[p] : cur.event.pitcher ?? 'P', "black", "none");
//             const killPlayer = killObject(p, 3300, "Object");
//             const killText = killObject(`${p}-text`, 3300, "Text");
//             return [move, moveText, killPlayer, killText];
//         })]
//     } else if (cur.phase === 'Pitch') {
//         animations = generateResetFielders(isHome, cur);

//         const speed = Math.min(120, Math.max(cur.pitchSpeed ?? 80, 80))
//         const duration = 1300 + ((100-speed)*10); // 1.3s +- .2s
//         const fromPos = {x: positions["Pitcher"][0], y: positions["Pitcher"][1], rotation: 0};
//         const toPos = {x: positions["Home"][0], y: positions["Home"][1], rotation: 1080};
//         const resultLocation = {x: toPos.x, y: toPos.y - 40};
//         const swingText = (cur.ballsIncreased || cur.strikesIncreased && cur.event.message.includes("looking")) ? "No Swing..." : "A Swing..."
//         let resultText = '';

//         if (cur.strikesIncreased)
//             resultText = "STRIKE!";
//             if (cur.event.message.includes('Foul'))
//                 resultText = "FOUL!";
//         else if (cur.ballsIncreased)
//             resultText = "BALL!";
//         else if (cur.outsIncreased)
//             resultText = "STRIKEOUT!";
//         else if (cur.event.message.includes('hit by pitch'))
//             resultText = "HBP!";

//         if (prev.event.message.includes('Foul'))
//             animations.push(foulBallAnimation("R"));
//         animations.push(createHoldTextKeyFrame('Ball', fromPos, 700, 800, "⚾", "red", "white"));
//         animations.push(createTextKeyFrame('Ball', fromPos, toPos, 1500, duration, "⚾", "red", "white"));
//         animations.push(createHoldTextKeyFrame('SwingText', resultLocation, 1500+duration, 4000-(1500+duration), swingText, "white", "white", 20));
//         animations.push(createHoldTextKeyFrame('SwingText', resultLocation, 4000, 1500, "And...", "white", "white", 20));
//         animations.push(createHoldTextKeyFrame('SwingText', resultLocation, 5500, 500, resultText, "white", "white", 20));
//     } else if (cur.phase === 'NowBatting') {
//         const dugout = isHome ? positions["AwayDugout"] : positions["HomeDugout"];
//         const fill = isHome ? `#${cur.awayColor}` : `#${cur.homeColor}`;
//         const stroke = getContrastTextColor(isHome ? cur.awayColor : cur.homeColor);

//         animations = generateResetFielders(isHome, cur);
//         if (prev.event.message.includes('struck out')){
//             reassignId('Batter', 'OldBatter');
//             reassignId('Batter-text', 'OldBatter-text');
//             animations.push(createMoveKeyFrame('OldBatter', {x: positions["BatterLeft"][0], y: positions["BatterLeft"][1]}, {x: dugout[0], y: dugout[1]}, 0, 2500, fill, stroke, 2700));
//             animations.push(createTextKeyFrame('OldBatter-text', {x: positions["BatterLeft"][0], y: positions["BatterLeft"][1]-20}, {x: dugout[0], y: dugout[1]-20}, 0, 2500, prev.event.batter ?? 'Batter', "black", "none", 12, 2700));
//         }
//         animations.push(createMoveKeyFrame('Batter', {x: dugout[0], y: dugout[1]}, {x: positions["BatterLeft"][0], y: positions["BatterLeft"][1]}, 0, 2500, fill, stroke));
//         animations.push(createTextKeyFrame('Batter-text', {x: dugout[0], y: dugout[1]-20}, {x: positions["BatterLeft"][0], y: positions["BatterLeft"][1]-20}, 0, 2500, next.event.batter ?? 'Batter', "black", "none"));
//     } else if (cur.phase === 'Field') {
//         let hitLocation = '';
//         const outCount = (cur.event.message.match(/\bout\b/gi) || []).length;
//         if (prev.event.message.includes("to center field"))
//             hitLocation = "CenterFielder";
//         else if (prev.event.message.includes("to left field"))
//             hitLocation = "LeftFielder";
//         else if (prev.event.message.includes("to right field"))
//             hitLocation = "RightFielder";
//         else if (prev.event.message.includes("to first base"))
//             hitLocation = "FirstBase";
//         else if (prev.event.message.includes("to second base"))
//             hitLocation = "SecondBase";
//         else if (prev.event.message.includes("to third base"))
//             hitLocation = "ThirdBase";
//         else if (prev.event.message.includes("to the shortstop"))
//             hitLocation = "Shortstop";

//         let throwChain: (keyof typeof positions)[] = ["Home", hitLocation];
//         let throwTimes: number[] = [1000+Math.random()*500];
//         let throwPositions: [number, number][] = [];

//         if (cur.event.message.includes("to")) {
//             const [_, throwPart] = cur.event.message.split(",", 2);
//             const matches = [...(throwPart?.matchAll(/\b([1-3][B]|SS|[LRC]F)\b/g) ?? [])].slice(1);
//             throwChain = [...throwChain, ...matches.map(match => inverseFielderLabels[match[1]]).filter(pos => !!pos)]; // Remove undefined
//         }
//         for (let i = 0; i < throwChain.length-2; i++)
//             throwTimes.push(1000+Math.random()*500)
//         for (const loc of throwChain)
//             throwPositions.push(jitterPosition(positions[loc]));

//         for (let i = 0; i < throwTimes.length; i++){
//             const startPos = {x: throwPositions[i][0], y: throwPositions[i][1], rotation: 0};
//             const endPos = {x: throwPositions[i+1][0], y: throwPositions[i+1][1], rotation: 600+Math.random()*1800};
//             const sumTime = throwTimes.slice(0, i).reduce((a, b) => a + b, 0); // Sum all previous indexes

//             const catcherStart = {x: positions[throwChain[i+1]][0], y: positions[throwChain[i+1]][1]};
//             const catcherMoveTime = 200 + Math.random()*500;
//             const catcherResetStart = sumTime+throwTimes[i]+Math.random()*300;

//             const catcherText = fielderLabels[throwChain[i+1]];
//             const catcherTextStart = getTextOffset(catcherStart)
//             const catcherTextEnd = getTextOffset(endPos);

//             animations.push(createTextKeyFrame('Ball', startPos, endPos, sumTime, throwTimes[i], "⚾")); // Move Ball
//             animations.push(createMoveKeyFrame(throwChain[i+1], catcherStart, endPos, sumTime+(Math.random()*300), catcherMoveTime)); // Move Players
//             animations.push(createTextKeyFrame(`${throwChain[i+1]}-text`, catcherTextStart, catcherTextEnd, sumTime+(Math.random()*300), catcherMoveTime, catcherText, "black", "none")); // Move Player Text

//             // Reset player
//             animations.push(createMoveKeyFrame(throwChain[i+1], endPos, catcherStart, catcherResetStart, 200));
//             animations.push(createTextKeyFrame(`${throwChain[i+1]}-text`, catcherTextEnd, catcherTextStart, catcherResetStart, 200, catcherText, "black", "none"));
//         }
//         // Reset Ball
//         const totalThrowTime = throwTimes.reduce((a, b) => a + b, 0);

//         const catcherStart = {x: positions[throwChain[throwChain.length-1]][0], y: positions[throwChain[throwChain.length-1]][1]};
//         const endPos = {x: throwPositions[throwPositions.length-1][0], y: throwPositions[throwPositions.length-1][1]};
//         const plate = {x: positions["Pitcher"][0], y: positions["Pitcher"][1], rotation: 0};
//         animations.push(createTextKeyFrame('Ball', endPos, catcherStart, totalThrowTime, 200, "⚾"));
//         animations.push(createTextKeyFrame('Ball', catcherStart, {x: plate.x, y: plate.y, rotation: 600+Math.random()*1800}, totalThrowTime + 600, 1000+Math.random()*400, "⚾"));

//         // Handle bases (the hard part)
//         const runStartDelay = 200 + Math.random()*200;
//         const safetyBuffer = 200+Math.random()*200; // Arrive 0.2-0.4s after the ball
//         const runnerTotalTime = totalThrowTime + safetyBuffer - runStartDelay;

//         // Batter got out
//         if (!cur.baseQueue.includes(prev.event.batter ?? '')) {
//             const outBase = baseFromFielder[throwChain[throwChain.length - 1]];
//             const outBaseIndex = basePath.indexOf(outBase);
//             const batterRunPath = basePath.slice(0, outBaseIndex + 1);

//             const segmentCount = batterRunPath.length;
//             const baseDurations: number[] = Array(segmentCount).fill(runnerTotalTime / segmentCount); // Equal timing (for now)

//             let runTime = runStartDelay;

//             for (let i = 0; i < segmentCount; i++) {
//                 const from = i === 0 ? positions["Home"] : positions[batterRunPath[i - 1]];
//                 const to = positions[batterRunPath[i]];
//                 const duration = baseDurations[i];

//                 animations.push(createMoveKeyFrame('Batter', { x: from[0], y: from[1] }, { x: to[0], y: to[1] }, runTime, duration));
//                 animations.push(createTextKeyFrame('Batter-text', getTextOffset({ x: from[0], y: from[1] }), getTextOffset({ x: to[0], y: to[1] }), runTime, duration, prev.event.batter ?? ''));
//                 runTime += duration;
//             }

//             const outPos = positions[outBase];
//             animations.push(createTextKeyFrame("OutMarker", { x: outPos[0], y: outPos[1] }, getTextOffset({ x: outPos[0], y: outPos[1] }), runTime, 500, "OUT!", "red", "red", 20));
//             animations.push(killObject("OutMarker", runTime+1000, "Text")); // Kill text

//             // Walk of shame
//             const dugout = isHome ? positions["AwayDugout"] : positions["HomeDugout"];
//             animations.push(createMoveKeyFrame('Batter', { x: outPos[0], y: outPos[1] }, {x: dugout[0], y: dugout[1]}, runTime+400, 1200));
//             animations.push(createTextKeyFrame('Batter-text', getTextOffset({ x: outPos[0], y: outPos[1] }), getTextOffset({x: dugout[0], y: dugout[1]}), runTime+400, 1200, prev.event.batter ?? ''));


//         }
//     }

//     return animations;
// }

// Well. Let's get to work?
export default function AnimatedGame({ homeTeam, awayTeam, game, id, }: { homeTeam: Team; awayTeam: Team; game: Game; id: string; }) {
    const [gameStates, setGameStates] = useState<GameState[]>([]);
    const [eventIndex, setEventIndex] = useState<number>(1);
    const [liveMode, setLiveMode] = useState<boolean>(true);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [renderTick, setRenderTick] = useState<number>(0); // Tick this to update the page

    // Pulls data from args which are hopefully /nextapi/gameheader
    // Easier to fetch data server-side and pass it in
    const events: Event[] = game.event_log;
    const players: string[] = [...Object.values(awayTeam.players), ...Object.values(homeTeam.players)].map(p => `${p.first_name} ${p.last_name}`);
    // Filler state to carry team info to the next
    const firstGameState: GameState = {
        index: -1,
        event: game.event_log[0],
        homeName: getTeamInitials(homeTeam),
        awayName: getTeamInitials(awayTeam),
        homeColor: game.home_team_color,
        awayColor: game.away_team_color,
        isGameOver: false,
        bases: { first: null, second: null, third: null },
        ballsIncreased: false,
        strikesIncreased: false,
        outsIncreased: false,
        baseQueue: [],
        phase: getPhase(game.event_log[0]),
    };

    const statesRef = useRef(gameStates);
    const playersRef = useRef(players);
    const liveModeRef = useRef(liveMode);
    const isPlayingRef = useRef(isPlaying);
    const lastAdvanceTime = useRef(performance.now());
    const lastAnimationStateRef = useRef<undefined|number>(undefined);
    const animationsRef = useRef<AnimationKeyFrame[]>([]);

    // Update references every tick
    useEffect(() => { statesRef.current = gameStates; }, [gameStates]);
    useEffect(() => { playersRef.current = players; }, [players]);
    useEffect(() => { liveModeRef.current = liveMode; }, [liveMode]);
    useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying]);

    // Build all GameStates on page launch
    useEffect(() => {
        if (!events.length) return;

        const states: GameState[] = [firstGameState];
        let currentState = { ...firstGameState }

        for (let i = 1; i < events.length; i++) {
            currentState = getGameState(currentState, events[i], players);
            states.push(JSON.parse(JSON.stringify(currentState))); // Is a deep copy needed? Who knows!
        }

        // Offset by three if live
        const finalState = states[states.length - 1];
        let lastEventIndex = finalState.isGameOver ? finalState.index : states[Math.max(states.length - 4, 0)].index;
        if (states[states.length - 1].isGameOver) {setLiveMode(false); lastEventIndex = 1;};
        setEventIndex(lastEventIndex ?? 1);

        setGameStates(states);
    }, [events])
    
    // The main meat of the equation
    useEffect(() => {
        let isMounted = true;
        let animationFrame: number;
        let lastAdvance = performance.now();

        // Fetch new events
        async function poll() {
            if (!isMounted) return;

            const states = statesRef.current;
            if (!states.length) return;
            if (states[states.length-1].isGameOver) return;

            // After needs to be one higher than last state
            const after = (states[states.length-1].index ?? 0) + 1;

            try {
                const res = await fetch(`/nextapi/game/${id}/live?after=${after}`);
                if (!res.ok) throw new Error("Failed to fetch live events");

                const newData = await res.json();
                const newEvents: Event[] = newData.entries;

                if (newEvents && newEvents.length > 0) {
                    setGameStates(prevStates => {
                        let currentState = { ...prevStates[prevStates.length - 1] };
                        const newStates: GameState[] = [];

                        for (const event of newEvents) {
                            currentState = getGameState(currentState, event, playersRef.current);
                            newStates.push({ ...currentState });
                        }

                        const lastNewState = newStates[newStates.length - 1];

                        // If game is over, exit live
                        if (lastNewState.isGameOver && liveModeRef.current)
                            setLiveMode(false);

                        return [...prevStates, ...newStates];
                    });
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }

        function advance() {
            if ((!isPlayingRef.current && !liveModeRef.current) || !statesRef.current.length) return;

            lastAdvanceTime.current = performance.now();
            setEventIndex(prev => Math.min(prev + 1, statesRef.current.length-1));
        }

        const tick = () => {
            const now = performance.now();
            const delta = now - lastAdvance;

            if (delta >= 6000) {
                poll();
                advance();
                lastAdvance = now;
            }

            setRenderTick(t => t + 1);
            animationFrame = requestAnimationFrame(tick); // Continue the loop
        }

        animationFrame = requestAnimationFrame(tick); // Start the loop
        return () => {
            isMounted = false;
            cancelAnimationFrame(animationFrame);
        }
    }, [id])

    // Animations (:
    useEffect(() => {
        if (!gameStates || gameStates.length === 0) return;
        if (lastAnimationStateRef.current !== gameStates[eventIndex].index) {
            let newAnimations = compileAnimationsFromGameState(gameStates[eventIndex-1], gameStates[eventIndex], gameStates[eventIndex+1]);
            newAnimations = [...newAnimations, ...garbageCollection(animationsRef.current, newAnimations)];
            intializeScene(newAnimations);
            animationsRef.current = newAnimations;
            lastAnimationStateRef.current = gameStates[eventIndex].index;
        }
    }, [gameStates, eventIndex]);

    function togglePlay() { setIsPlaying(p => !p); }
    function skipTo(index: number) { 
        setIsPlaying(false); 
        setEventIndex(Math.max(1, Math.min(index, gameStates.length - 1)));
        lastAdvanceTime.current = performance.now();
    }

    useEffect(() => {
        applyAnimations(animationsRef.current, performance.now() - lastAdvanceTime.current);
    }, [renderTick]); // Reruns each frame

    if (!gameStates.length || gameStates.length === 0 || eventIndex === 0) return (<Loading />);

    return (<main className="mt-16">
        <div className="w-full max-w-[min(100vw,1250px)] mx-auto mt-20">
            <FieldBackground lastGameState={gameStates[eventIndex-1]} gameState={gameStates[eventIndex]} nextGameState={gameStates[eventIndex+1]} deltaTime={performance.now() - lastAdvanceTime.current} />
            <div className="controls flex flex-col justify-center items-center gap-4 text-center">
                {liveMode ? 
                    <div className="text-theme-text font-semibold">"LIVE 🔴"</div> 
                :
                    <>
                        <div className="text-3xl text-theme-text"> Event {eventIndex}/{statesRef.current.length}</div>
                        <div className="flex gap-2">
                            <button onClick={() => skipTo(eventIndex-1)} className="px-2 py-1 text-6xl">⏪</button>
                            <button onClick={() => togglePlay()} className="px-2 py-1 text-6xl">{!isPlaying ? '▶️' : '⏸️'}</button>
                            <button onClick={() => skipTo(eventIndex+1)} className="px-2 py-1 text-6xl">⏩</button>
                        </div>
                    </>
                }
            </div>
        </div>
    </main>);
}

function MessageBox({ message }: { message: string }) {
    return (<g transform="scale(1) translate(8, 525)">
        <rect x="0" y="0" width="634" height="100" fill="black" stroke="white" strokeWidth="16" />
        <rect x="20" y="20" width="595" height="60" stroke="yellow" strokeWidth="4" fill="none" />
        <foreignObject x="25" y="25" width="580" height="153">
            <div style={{ fontSize: 12, fontFamily: "geist, sans-serif", fontWeight: "bold", color: "white" }} dangerouslySetInnerHTML={{__html: message}} />
        </foreignObject>
    </g>);
}

function InningInfo({ gameState }: { gameState: GameState }){
    return (<g transform="scale(0.75) translate(8, 455)">
        <rect x="0" y="0" width="240" height="230" fill="black" stroke="white" strokeWidth="16" />
        <text x="110" y="192" textAnchor="end" fill="white" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            OUT
        </text>
        <rect x="120" y="160" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text x="185" y="192" fill="white" textAnchor="end" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            {gameState.event.outs ?? 0}
        </text>
        
        <text x="110" y="52" textAnchor="end" fill="white" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            BALL
        </text>
        <rect x="120" y="20" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text x="185" y="52" fill="white" textAnchor="end" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            {gameState.event.balls ?? 0}
        </text>

        <text x="110" y="122" textAnchor="end" fill="white" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            STRIKE
        </text>
        <rect x="120" y="90" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text x="185" y="122" fill="white" textAnchor="end" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            {gameState.event.strikes ?? 0}
        </text>
    </g>)
}

function GameInfo({ gameState }: { gameState: GameState }) {
    return (<g transform="scale(0.75) translate(618.5, 455)">
        <rect x="0" y="0" width="240" height="230" fill="black" stroke="white" strokeWidth="16" />
        {gameState.isGameOver ? (
            <text x="200" y="52" textAnchor="end" fill="white" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
                FINAL
            </text>
        ) : (
            <>
                <text x="110" y="192" textAnchor="end" fill="white" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
                    INNING
                </text>
                <rect x="120" y="160" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
                <text x="132" y="192" fill="white" style={{ fontSize: 20 }}>
                    {gameState.event.inning_side === 0 ? "▲" : "▼"}
                </text>
                <text x="185" y="192" fill="white" textAnchor="end" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
                    {gameState.event.inning}
                </text>
            </>
        )}

        {gameState.event.inning_side === 0 ? (
            <image x="80" y="30" width="25" height="25" href="/Baseball_bat.svg" />
        ) : (
            <text x="110" y="52" textAnchor="end" style={{ fontSize: 25 }}>
                ⚾
            </text>
        )}
        
        <text x="74" y="52" fill="white" textAnchor="end" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            {gameState.awayName}
        </text>
        <rect x="120" y="20" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text x="185" y="52" fill="white" textAnchor="end" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            {gameState.event.away_score}
        </text>

        {!(gameState.event.inning_side === 0) ? (
            <image x="80" y="100" width="25" height="25" href="/Baseball_bat.svg" />
        ) : (
            <text x="110" y="122" textAnchor="end" style={{ fontSize: 25 }}>
                ⚾
            </text>
        )}

        <text x="74" y="122" fill="white" textAnchor="end" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            {gameState.homeName}
        </text>
        <rect x="120" y="90" width="80" height="50" stroke="yellow" strokeWidth="4" fill="none" />
        <text x="185" y="122" fill="white" textAnchor="end" style={{ fontSize: 25, fontFamily: "scoreboard, sans-serif", fontWeight: "bold" }}>
            {gameState.event.home_score}
        </text>
    </g>)
}

function FieldBackground({ lastGameState, gameState, nextGameState, deltaTime, }: { lastGameState: GameState, gameState: GameState, nextGameState: GameState, deltaTime: number }) {
    // Code borrowed from
    // https://github.com/RangerRick/blobile
    
    return (
        <svg id="scene" xmlns="http://www.w3.org/2000/svg" version="1.0" preserveAspectRatio="xMinYMin meet" viewBox="0 0 650 650">
            <filter id="dropShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation={3} />
                <feOffset dx={0} dy={0} />
                <feComponentTransfer>
                    <feFuncA type="linear" slope={0.4} />
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <g className="strokeme">
                <path style={{fill: "#00a831", fillOpacity: 1, fillRule: "evenodd", stroke: "none", strokeWidth: 1, strokeLinecap: "butt", strokeLinejoin: "miter", strokeOpacity: 1,}} d="M 150,520 L 0,520 L 0,0 L 650,0 L 650,520 L 508,520 L 150,520 z " />
                
                {/* dirt */}
                <path style={{opacity: 1, fill: "#a48e28", fillOpacity: 1, stroke: "#85881b", strokeWidth: 1.04379344, strokeLinecap: "butt", strokeLinejoin: "bevel", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} d="M 205,752.36218 A 95,95 0 0 1 395,752.36218" transform="matrix(1.989102,0,0,1.978205,-268.2308,-1169.879)"/>
                
                {/* dirt corner (right) */}
                <path style={{fill: "#00a831", fillOpacity: 1, fillRule: "evenodd", stroke: "none", strokeWidth: 1, strokeLinecap: "butt", strokeLinejoin: "miter", strokeOpacity: 1,}} d="M 328.5,439.48263 L 538.5,229.48266 L 538.5,439.48263 L 328.5,439.48263 z " />
                
                {/* dirt corner (left) */}
                <path style={{fill: "#00a831", fillOpacity: 1, fillRule: "evenodd", stroke: "none", strokeWidth: 1, strokeLinecap: "butt", strokeLinejoin: "miter", strokeOpacity: 1,}} d="M 328.5,439.48263 L 124.5,235.48266 L 123.5,439.48263 L 328.5,439.48263 z " />
                
                {/* diamond grass */}
                <rect style={{opacity: 1, fill: "#00a837", fillOpacity: 1, stroke: "#85881b", strokeWidth: 4.99999857, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} width={168.31494} height={168.31494} x={-77.781464} y={374.03622} transform="matrix(0.707107,-0.707107,0.707107,0.707107,0,0)" />
                
                {/* dirt (home) */}
                <path style={{opacity: 1, fill: "#85881b", fillOpacity: 1, stroke: "none", strokeWidth: 1, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} d="M 371 430 A 43 43 0 1 1  285,430 A 43 43 0 1 1  371 430 z" />
                
                {/* pitcher's mound */}
                <path style={{opacity: 1, fill: "#b56700", fillOpacity: 1, stroke: "#85881b", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} d="M 318 752.36218 A 18 18 0 1 1  282,752.36218 A 18 18 0 1 1  318 752.36218 z" transform="translate(28.5,-432.8794)" />
                
                {/* pitcher's plate */}
                <rect style={{opacity: 1, fill: "white", fillOpacity: 1, stroke: "none", strokeWidth: 3, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} width={14} height={4} x={321.5} y={317.4827} />
                
                {/* foul line (right) */}
                <path style={{fill: "none", fillOpacity: 0.75, fillRule: "evenodd", stroke: "white", strokeWidth: 3.01047993, strokeLinecap: "square", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} d="M 363.00993,405 C 650.37706,117.62236 650.37706,117.62236 650.37706,117.62236" />
                
                {/* foul line (left) */}
                <path style={{fill: "none", fillOpacity: 0.75, fillRule: "evenodd", stroke: "white", strokeWidth: 3, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} d="M 293.77042,404.99993 C -2.1085256,109.12113 -2.1085256,109.12113 -2.1085256,109.12113" />
                
                {/* batter's box (right) */}
                <rect style={{opacity: 1, fill: "#85881b", fillOpacity: 1, stroke: "white", strokeWidth: 1, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} width={15} height={35} x={340} y={410}/>
                
                {/* batter's box (left) */}
                <rect style={{opacity: 1, fill: "#85881b", fillOpacity: 1, stroke: "white", strokeWidth: 1, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} width={15} height={35} x={300} y={410} />
                
                {/* first base */}
                <rect style={{opacity: 1, fill: "white", fillOpacity: 1, stroke: "none", strokeWidth: 3, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} width={10.242652} height={10.242652} x={531.56042} y={-95.300102} transform="matrix(0.707107,0.707107,-0.707107,0.707107,0,0)" />
                
                {/* second base */}
                <rect style={{opacity: 1, fill: "white", fillOpacity: 1, stroke: "none", strokeWidth: 3, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} width={10.242655} height={10.242655} x={369.26904} y={-95.643242} transform="matrix(0.707107,0.707107,-0.707107,0.707107,0,0)" />
                
                {/* third base */}
                <rect style={{opacity: 1, fill: "white", fillOpacity: 1, stroke: "none", strokeWidth: 3, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} width={10.242649} height={10.242649} x={369.26904} y={66.99128} transform="matrix(0.707107,0.707107,-0.707107,0.707107,0,0)" />

                {/* home plate */}
                <path style={{fill: "white", fillOpacity: 1, stroke: "none", strokeWidth: 3, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeOpacity: 1,}} d="M 320,423 L 335,423 L 335,430.7492 L 327.72761,438 L 320,429.78055 L 320,423 z" />
                {/* home border */}
                <path style={{opacity: 1, fill: "white", fillOpacity: 1, stroke: "none", strokeWidth: 3, strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 4, strokeDasharray: "none", strokeOpacity: 1,}} d="M 295,405 C 295.15103,402.74278 293.1875,403.97917 292.28125,403.46875 C 280.62645,419.16193 280.35712,439.683 291.625,455.65625 C 305.77503,475.71519 333.59731,480.52502 353.65625,466.375 C 373.71519,452.22497 378.52502,424.40269 364.375,404.34375 L 361,405 C 362.65625,407.375 361,405 362.65625,407.375 L 293.875,406.53125 L 295,405 z M 293.875,406.53125 L 362.65625,407.375 C 374.80016,425.99135 370.24983,450.98832 351.9375,463.90625 C 333.20494,477.12061 307.30812,472.67006 294.09375,453.9375 C 283.82751,439.38417 283.83997,421.05606 293.875,406.53125 z" />
            
                <GameInfo gameState={lastGameState}/>
                <InningInfo gameState={lastGameState}/>
                <MessageBox message={lastGameState.event.message} />

            </g>
        </svg>
    );
}