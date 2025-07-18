// Author: Luna
// I had a brain wave and this came to me in a dream

'use client'
import { ProcessMessage } from "@/components/BaseParser";
import { Bases } from "@/types/Bases";
import { Event } from "@/types/Event";
import { Game } from "@/types/Game";
import { Team } from "@/types/Team";
import { useEffect, useMemo, useRef, useState } from "react";
import Loading from "./Loading";

type GameState = {
    index?: number;
    message?: string;
    outs?: number; // 0-3
    strikes?: number; // 0-3
    balls?: number; // 0-3
    onDeck?: string; // Player Name (or id)
    batting?: string; // Player Name (or id)
    pitching?: string; // Player Name (or id)
    homeScore?: number;
    awayScore?: number;
    homeColor?: string;
    awayColor?: string;
    pitchInfo?: string;
    zone?: number;
    inning?: number;
    inningSide?: number; // 1 = Bottom, 2 = Top (enum?)
    isGameOver?: boolean;
    bases?: Bases;
    baseQueue?: string[];
}

const animationTimings: Record<string, {start: number, end: number}> = {
    "setup": {start: 0, end: 1500}, // Walk to bat
    "ballThrow": {start: 1500, end: 3000}, // Ball is thrown to catcher/home/batter
    "ballFly": {start: 3000, end: 4500}, // Ball flies out of field, to a catch, through foul line, or is just caught by catcher
    "reset": {start: 4500, end: 6000}, // Ball ends up back at pitcher, whether it is thrown back or just appears
    "firstAdvance": {start: 6000, end: 7500}, // Batter walks to first, and others advance one base
    "secondAdvance": {start: 7500, end: 9000}, // Batter walks to second base if applicable, others advance a base, ball is thrown to second defense if applicable
    "thirdAdvance": {start: 9000, end: 10500}, // As above but third
    "fourthAdvance": {start: 10500, end: 12000}, // Applicable to homers/grand slam
}

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
    "Catcher": [327.8, 435],
    "BatterLeft": [320, 428],
    "BatterRight": [347.5, 428],
    "FirstRunner": [443, 315],
    "SecondRunner": [328.5, 200],
    "ThirdRunner": [212, 315],
    "HomeDugout": [475, 400],
    "AwayDugout": [175, 400],
}

const fielderLabels: Record<string, string> = {
    "CenterFielder": "CF",
    "LeftFielder": "LF",
    "RightFielder": "RF",
    "FirstBase": "1B",
    "SecondBase": "2B",
    "Shortstop": "SS",
    "ThirdBase": "3B",
};

const inverseFielderLabels: Record<string, string> = {
    "CF": "CenterFielder",
    "LF": "LeftFielder",
    "RF": "RightFielder",
    "1B": "FirstBase",
    "2B": "SecondBase",
    "SS": "Shortstop",
    "3B": "ThirdBase",
};

function parseEvent(gameState: GameState, event: Event, players: string[]): GameState {
    const { bases, baseQueue } = ProcessMessage(event, players, gameState.baseQueue ? gameState.baseQueue : []);
    return {
        ...gameState,
        index: event.index,
        message: event.message,
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
        pitchInfo: event.pitch_info,
        zone: Number(event.zone),
        inning: event.inning,
        inningSide: event.inning_side,
        isGameOver: event.event === "RecordKeeping" || event.message.includes('Final score:'),
    };
}

// So basically what I want to do here is make it so it processes every message
// Then I want it to have a three message buffer
// It can then use this buffer to look ahead and see the outcome of the current event
// E.G. If the next event has someone stealing a base, then make them start walking towards it during this time frame

export default function LivePage({ awayTeam, homeTeam, game, id }: {awayTeam: Team; homeTeam: Team; game: Game, id: string;}) {
    const [gameStates, setGameStates] = useState<GameState[]>([]);
    const [eventIndex, setEventIndex] = useState<number>(1);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [liveMode, setLiveMode] = useState<boolean>(true);
    const lastAdvanceTime = useRef(performance.now());
    const [renderTick, setRenderTick] = useState(0); // Update state to re-render

    // Pulls data from args which are hopefully fetched from /nextapi/gameheader
    // Easier to fetch server side and pull to client component than to fetch on client component
    const events: Event[] = game.event_log;
    const players: string[] = [...Object.values(awayTeam.players), ...Object.values(homeTeam.players)].map(p => `${p.first_name} ${p.last_name}`);
    const initialGameState: GameState = {};

    const statesRef = useRef(gameStates);
    const playersRef = useRef(players);
    const isPlayingRef = useRef(isPlaying);
    const liveModeRef = useRef(liveMode);
    const eventIndexRef = useRef(eventIndex);

    useEffect(() => { statesRef.current = gameStates; }, [gameStates]);
    useEffect(() => { playersRef.current = players; }, [players]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { liveModeRef.current = liveMode; }, [liveMode]);
    useEffect(() => { eventIndexRef.current = eventIndex; }, [eventIndex]);

    // Build all game states on page open (laggy probably)
    useEffect(() => {
        if (!events.length) return;

        const states: GameState[] = [];
        let currentState = { ...initialGameState };

        for (let i = 0; i < events.length; i++) {
            currentState = parseEvent(currentState, events[i], players);
            states.push(JSON.parse(JSON.stringify(currentState))); // Is a deep copy really needed? Uh, remove it and find out?
        }

        let lastEvent = states.length > 3 ? states[states.length - 1].isGameOver ? states[states.length - 1].index : states[states.length - 4].index : 1;
        if (states[states.length - 1].isGameOver) {setLiveMode(false); lastEvent = 1;};
        setEventIndex(lastEvent ?? 1);

        setGameStates(states);
    }, [events]);

    // Animation helper
    useEffect(() => {
        let isMounted = true;
        let animationFrame: number;
        let lastAdvance = performance.now();

        async function poll() {
            if (!isMounted) return;

            const states = statesRef.current;
            if (!states.length) return;

            if (states[states.length - 1].isGameOver) return;

            const after = (states[states.length - 1].index ?? 0) + 1;

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
                            currentState = parseEvent(currentState, event, playersRef.current);
                            newStates.push({ ...currentState });
                        }

                        const lastNewState = newStates[newStates.length - 1];

                        // If game is over, exit live
                        if (lastNewState?.isGameOver && liveModeRef.current) {
                            setLiveMode(false);
                            setEventIndex(prevStates.length + newStates.length - 1);
                        }

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
            eventIndexRef.current++;
            console.log(statesRef.current.length);
            setEventIndex(Math.min(eventIndexRef.current, statesRef.current.length-1));
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
            animationFrame = requestAnimationFrame(tick);
        };

        animationFrame = requestAnimationFrame(tick);
        return () => {
            isMounted = false;
            cancelAnimationFrame(animationFrame);
        };
    }, [id]);

    const currentState = gameStates[eventIndex];

    if (!gameStates.length || gameStates.length === 0 || eventIndex === 0) return (<Loading />);

    return (
        <div>
            <div className="controls mt-20">
                {!liveMode && (<><button onClick={() => setEventIndex(i => Math.max(0, i - 1))}>⏮️</button>
                <button onClick={() => setIsPlaying(p => !p)}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={() => setEventIndex(i => Math.min(gameStates.length-1, i + 1))}>⏭️</button></>)}
            </div>
            <div>
                {eventIndex}/{gameStates.length > 3 ? gameStates[gameStates.length - 1].isGameOver ? gameStates[gameStates.length - 1].index : gameStates[gameStates.length - 4].index : 0}
            </div>

            <div>
                {liveMode ? "LIVE 🔴" : ""}
            </div>

            <div className="state">
                <pre>{JSON.stringify(currentState, null, 2)}</pre>
            </div>
            <div className="w-full max-w-[min(100vw,1250px)] aspect-square mx-auto">
                <FieldBackground lastGameState={gameStates[eventIndex-1]} gameState={gameStates[eventIndex]} nextGameState={gameStates[eventIndex+1]} deltaTime={performance.now() - lastAdvanceTime.current}/>
            </div>
        </div>
    );
}

function FieldBackground({ lastGameState, gameState, nextGameState, deltaTime }: {lastGameState: GameState, gameState: GameState, nextGameState: GameState, deltaTime: number}) {
    // Some code borrowed from
    // https://github.com/RangerRick/blobile

    const curBalls = gameState?.balls ?? 0;
    const curStrikes = gameState?.strikes ?? 0;
    const curOuts = gameState?.outs ?? 0;

    const lastBalls = lastGameState?.balls ?? 0;
    const lastStrikes = lastGameState?.strikes ?? 0;
    const lastOuts = lastGameState?.outs ?? 0;

    let batterMessage = '';

    const ballsIncreased = curBalls > lastBalls;
    const strikesIncreased = curStrikes > lastStrikes;
    const outsIncreased = curOuts > lastOuts;

    if (gameState.message?.includes('Foul')) {
        batterMessage = 'Foul!';
    } else if (strikesIncreased) {
        batterMessage = 'Strike!';
    } else if (outsIncreased || (lastGameState.outs !== null && gameState.outs === null)) {
        batterMessage = 'Out!';
    } else if (ballsIncreased) {
        batterMessage = 'Ball!';
    }

    const homeToFirst = gameState.message?.includes("hits") || gameState.message?.includes('walks');
    const firstToSecond = gameState.bases?.second && gameState.bases?.second === lastGameState.bases?.first;
    const secondToThird = gameState.bases?.third && gameState.bases?.third === lastGameState.bases?.second;
    const thirdToHome = lastGameState.bases?.third && !gameState.baseQueue?.includes(lastGameState.bases.third);

    let ballHitLocation = "";
    let jitteredTarget: [number, number] = [0, 0];
    if (homeToFirst && !gameState.baseQueue?.includes(gameState.batting ?? '')) {
        if (gameState.message?.includes("to center field"))
            ballHitLocation = "CenterFielder";
        else if (gameState.message?.includes("to left field"))
            ballHitLocation = "LeftFielder";
        else if (gameState.message?.includes("to right field"))
            ballHitLocation = "RightFielder";
        else if (gameState.message?.includes("to first base"))
            ballHitLocation = "FirstBase";
        else if (gameState.message?.includes("to second base"))
            ballHitLocation = "SecondBase";
        else if (gameState.message?.includes("to third base"))
            ballHitLocation = "ThirdBase";
        jitteredTarget = useMemo(() => {
            const base = positions[ballHitLocation];
            return [base[0] + (-25+(Math.random()*50)), base[1] + (-25+(Math.random()*50))];
        }, [ballHitLocation]);
    }

    let throwChain: (keyof typeof positions)[] = [];

    if (nextGameState.message?.includes("to")) {
    const [, throwPart] = nextGameState.message.split(",", 2);
    const matches = [...(throwPart?.matchAll(/\b([1-3][B]|SS|[LRC]F)\b/g) ?? [])];

    throwChain = matches
        .map(match => inverseFielderLabels[match[1]])
        .filter(pos => !!pos); // Remove undefined
    }
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.0" preserveAspectRatio="xMinYMin meet" viewBox="0 0 650 650">
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

                <FieldersMoving deltaTime={deltaTime} message={gameState.message || ""} inningSide={gameState.inningSide} exclude={[ballHitLocation]} />

                {(lastGameState.bases?.first) && (!firstToSecond || firstToSecond && deltaTime < 1000) && (<>
                        <circle cx={positions["FirstRunner"][0]} cy={positions["FirstRunner"][1]} r={6} fill="black" stroke="white" />
                        <text x={positions["FirstRunner"][0]} y={positions["FirstRunner"][1] - 10} fontSize={10} textAnchor="middle" fill="black">{lastGameState.bases?.first}</text>
                    </>)}
                {(lastGameState.bases?.second) && (!secondToThird || secondToThird && deltaTime < 1000) && (<>
                        <circle cx={positions["SecondRunner"][0]} cy={positions["SecondRunner"][1]} r={6} fill="black" stroke="white" />
                        <text x={positions["SecondRunner"][0]} y={positions["SecondRunner"][1] - 10} fontSize={10} textAnchor="middle" fill="black">{lastGameState.bases?.second}</text>
                    </>)}
                {(lastGameState.bases?.third) && (!thirdToHome || thirdToHome && deltaTime < 1000) && (<>
                        <circle cx={positions["ThirdRunner"][0]} cy={positions["ThirdRunner"][1]} r={6} fill="black" stroke="white" />
                        <text x={positions["ThirdRunner"][0]} y={positions["ThirdRunner"][1] - 10} fontSize={10} textAnchor="middle" fill="black">{lastGameState.bases?.third}</text>
                    </>)}

                {(gameState.pitching) && (<>
                        <circle cx={positions["Pitcher"][0]} cy={positions["Pitcher"][1]} r={6} fill="white" stroke="black" />
                        <text x={positions["Pitcher"][0]} y={positions["Pitcher"][1] - 10} fontSize={10} textAnchor="middle" fill="black">{gameState.pitching}</text>
                    </>)}
                {(gameState.batting) && (!homeToFirst || homeToFirst && deltaTime < 1000) && (!outsIncreased) && (<>
                        <circle cx={positions["BatterRight"][0]} cy={positions["BatterRight"][1]} r={6} fill="black" stroke="white" />
                        <text x={positions["BatterRight"][0]} y={positions["BatterRight"][1] - 10} fontSize={10} textAnchor="middle" fill="black">{gameState.batting}</text>
                    </>)}
                
                {deltaTime > 0 && deltaTime < 1000 && gameState.pitchInfo && <ThrownBall startPos="Pitcher" endPos="Home" delta={deltaTime}/>}
                {deltaTime > 1000 && deltaTime < 3000 && gameState.pitchInfo && <ResultText text={batterMessage} position="Home"/>}
                {deltaTime > 1000 && deltaTime < 3000 && homeToFirst && <RunnerMoving startBase="BatterRight" endBase="FirstRunner" runnerName={lastGameState.batting ?? 'Unknown'} deltaTime={deltaTime} />}
                {deltaTime > 1000 && deltaTime < 3000 && firstToSecond && <RunnerMoving startBase="FirstRunner" endBase="SecondRunner" runnerName={gameState.bases?.second ?? 'Unknown'} deltaTime={deltaTime} />}
                {deltaTime > 1000 && deltaTime < 3000 && secondToThird && <RunnerMoving startBase="SecondRunner" endBase="ThirdRunner" runnerName={gameState.bases?.third ?? 'Unknown'} deltaTime={deltaTime} />}
                {deltaTime > 1000 && deltaTime < 3000 && thirdToHome && <RunnerMoving startBase="ThirdRunner" endBase="Home" runnerName={lastGameState.bases?.third ?? 'Unknown'} deltaTime={deltaTime} />}
                {deltaTime > 3000 && deltaTime < 4000 && homeToFirst && !gameState.baseQueue?.includes(gameState.batting ?? '') && (<>
                    <RunnerMoving startBase="FirstRunner" endBase={gameState.inningSide === 1 ? "HomeDugout" : "AwayDugout"} deltaTime={deltaTime} runnerName={lastGameState.batting ?? 'Unknown'} start={3000} end={4000}/>
                    <ResultText position="FirstRunner" text="Out!" />
                    <ResultText text="Caught!" position={ballHitLocation} />
                </>)}
                {deltaTime < 3000 && <ResultText text={gameState.pitchInfo ?? ''} position="Pitcher" />}

                {/* hit ball */}
                {deltaTime > 1000 && deltaTime < 3000 && homeToFirst && (() => {
                    return (
                        <>
                            <ThrownBall start={1000} end={3000} delta={deltaTime} startPos="Home" endPos={ballHitLocation} endOverride={jitteredTarget}/>
                        </>
                    );
                })()}
                {deltaTime < 3200 && ballHitLocation && homeToFirst && (<RunnerMoving fill="white" stroke="black" start={1000} end={2000} deltaTime={deltaTime} startBase={ballHitLocation} endBase={ballHitLocation} endOverride={jitteredTarget} runnerName={fielderLabels[ballHitLocation]}/>)}
                {deltaTime > 3200 && ballHitLocation && (<RunnerMoving fill="white" stroke="black" start={3200} end={4000} deltaTime={deltaTime} startBase={ballHitLocation} endBase={ballHitLocation} startOverride={jitteredTarget} runnerName={fielderLabels[ballHitLocation]}/>)}
                {throwChain.length >= 2 &&
  throwChain.slice(0, -1).map((from, i) => {
    const to = throwChain[i + 1];
    const segmentDuration = 200; // customize if needed
    const segStart = 1000 + i * segmentDuration;
    const segEnd = segStart + segmentDuration;

    return (
      <ThrownBall
        key={`${from}-${to}`}
        delta={deltaTime}
        start={segStart}
        end={segEnd}
        startPos={from}
        endPos={to}
      />
    );
  })
}

            </g>
        </svg>
    );
}

function HoldPlayer({player, position, stroke="black", fill="white"}: {player: keyof typeof fielderLabels, position: [number, number], stroke?: string, fill?: string}) {
    return (
        <g key={player}>
            <circle cx={position[0]} cy={position[1]} r={6} fill={fill} stroke={stroke}/>
            <text x={position[0]} y={position[1] - 10} fontSize={10} textAnchor="middle" fill="black">
                {fielderLabels[player]}
            </text>
        </g>
    );
}

function ResultText({text, position}: {text: string, position: keyof typeof positions,}) {
    return (
        <text x={positions[position][0]} y={positions[position][1] - 22} fontSize={12} textAnchor="middle" fill="red" fontWeight="bold">
            {text}
        </text>
    )
}

function ThrownBall({delta, startPos, endPos, endOverride, start=0, end=1000}: {delta: number, startPos: keyof typeof positions, endPos: keyof typeof positions, endOverride?: [number, number], start?: number, end?: number}){   
    const t = Math.min(1, Math.max(0, interpolate(start, end, delta)));

    const from = positions[startPos];
    const to = endOverride ?? positions[endPos];

    const x = from[0] + (to[0] - from[0]) * t;
    const y = from[1] + (to[1] - from[1]) * t;

    return (<>
        <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke="red" strokeOpacity={0.5} strokeWidth={2} />
        <circle cx={x} cy={y} r={3} fill="red" stroke="black" />
    </>);
}

function RunnerMoving({startBase, endBase, startOverride, endOverride, runnerName, deltaTime, start=1000, end=3000, stroke="white", fill="black"}: {startBase: keyof typeof positions; endBase: keyof typeof positions, startOverride?: [number, number], endOverride?: [number, number], runnerName: string; deltaTime: number, start?: number, end?: number, stroke?: string, fill?: string}) {
    const startPos = startOverride ?? positions[startBase];
    const endPos = endOverride ?? positions[endBase];
    const progress = interpolate(start, end, deltaTime)

    const x = lerp(startPos[0], endPos[0], progress);
    const y = lerp(startPos[1], endPos[1], progress);

    return (
        <>
            <circle cx={x} cy={y} r={6} fill={fill} stroke={stroke} />
            <text x={x} y={y - 10} fontSize={10} textAnchor="middle" fill="black">{runnerName}</text>
        </>
    );
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function interpolate(start: number, end: number, current: number) {
    if (current <= start) return 0;
    if (current >= end) return 1;
    return (current - start) / (end - start);
}

function FieldersMoving({deltaTime, message, inningSide, exclude=[]}: {deltaTime: number, message: string, inningSide: number | undefined, exclude?: string[]}) {
    const isEntering = message?.includes("Start of the");
    const isExiting = message?.includes("End of the");

    const dugout = inningSide === 1 ? "HomeDugout" : "AwayDugout";

    return (
        <>
            {Object.entries(fielderLabels).map(([position, label]) => {
                if (!positions[position] || exclude.includes(position)) return null;
                if (isEntering) {
                    return (
                        <RunnerMoving key={position} deltaTime={deltaTime} startBase={dugout} endBase={position} start={3000} end={6000} runnerName={label} stroke="black" fill="white"/>
                    );
                } else if (isExiting) {
                    return (
                        <RunnerMoving key={position} deltaTime={deltaTime} startBase={position} endBase={dugout} start={3000} end={6000} runnerName={label} stroke="black" fill="white" />
                    );
                } else {
                    return (
                        <g key={position}>
                            <circle cx={positions[position][0]} cy={positions[position][1]} r={6} fill="white" stroke="black"/>
                            <text x={positions[position][0]} y={positions[position][1] - 10} fontSize={10} textAnchor="middle" fill="black">
                                {label}
                            </text>
                        </g>
                    );
                }
            })}
        </>
    );
}
