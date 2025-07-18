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

type AnimatedPlayer = {
    name: string;
    position: string;
    stroke: string;
    fill: string;
    coordinates?: [number, number];
};

type AllPlayers = {
    LeftFielder: AnimatedPlayer;
    CenterFielder: AnimatedPlayer;
    RightFielder: AnimatedPlayer;
    FirstBase: AnimatedPlayer;
    SecondBase: AnimatedPlayer;
    Shortstop: AnimatedPlayer;
    ThirdBase: AnimatedPlayer;
    Pitcher: AnimatedPlayer;
    Catcher: AnimatedPlayer;
    Batter: AnimatedPlayer;
    FirstRunner: AnimatedPlayer;
    SecondRunner: AnimatedPlayer;
    ThirdRunner: AnimatedPlayer;
    OldBatter: AnimatedPlayer;
}

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

type Animation = {
    subject: string; // "ball" or {player} or "bat" (maybe more later)
    start: number; // The deltaTime (0-6000) to start the animation
    end: number; // ^ Above but end
    from: [number, number];
    to: [number, number];
    done: boolean; // This will speed up checks slightly
}

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
}

function interpolate(a: number, b: number, t: number): number {
    return a + (b - a) * t;
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
    const animationsRef = useRef<Animation[]>([]);

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

    function togglePlay() { setIsPlaying(p => !p); }
    function skipTo(index: number) { 
        setIsPlaying(false); 
        setEventIndex(Math.max(1, Math.min(index, gameStates.length - 1)));
    }

    if (!gameStates.length || gameStates.length === 0 || eventIndex === 0) return (<Loading />);

    return (<main className="mt-16">
        <div className="w-full max-w-[min(100vw,1250px)] mx-auto mt-20">
            <FieldBackground lastGameState={gameStates[eventIndex-1]} gameState={gameStates[eventIndex]} nextGameState={gameStates[eventIndex+1]} deltaTime={performance.now() - lastAdvanceTime.current} animationsRef={animationsRef} />
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

function DrawPlayer({ player, }: { player: AnimatedPlayer, }) {
    if (!player.coordinates) return;
    return (<>
        <circle cx={player.coordinates[0]} cy={player.coordinates[1]} r={6} fill={player.fill} stroke={player.stroke}/>
        <text x={player.coordinates[0]} y={player.coordinates[1] - 10} fontSize={10} textAnchor="middle" fill="black">
            {player.name}
        </text>
    </>);
}

function DrawPlayers({ players, }: { players: AllPlayers, }) {
    return (<>
        {Object.values(players).map((p, i) => (
            <DrawPlayer key={i} player={p} />
        ))}
    </>);
}

// This is the real real hard part...
function AnimationComponents({ prevGameState, gameState, nextGameState, deltaTime, animationsRef, }: { prevGameState: GameState, gameState: GameState, nextGameState: GameState, deltaTime: number, animationsRef: RefObject<Animation[]>, }) {
    const homeTeamFielding = gameState.event.inning_side === 0;
    const fieldingPositions = ["LeftFielder", "CenterFielder", "RightFielder", "FirstBase", "SecondBase", "Shortstop", "ThirdBase", "Catcher", "Pitcher"];
    const runningPositions = ["BatterLeft", "BatterRight", "FirstRunner", "SecondRunner", "ThirdRunner"]
    const namedPositions: Record<string, string> = {
        "BatterLeft": '',
        "BatterRight": gameState.event.batter ?? '',
        "FirstRunner": gameState.bases.first ?? '',
        "SecondRunner": gameState.bases.second ?? '',
        "ThirdRunner": gameState.bases.third ?? '',
        "Pitcher": gameState.event.pitcher ?? '',
    }

    const players: AllPlayers = {...Object.fromEntries(
        fieldingPositions.map(pos => [
            pos,
            {
                name: namedPositions[pos] ?? fielderLabels[pos],
                position: pos,
                fill: homeTeamFielding ? `#${gameState.homeColor}` : `#${gameState.awayColor}`,
                stroke: homeTeamFielding ? getContrastTextColor(gameState.homeColor) : getContrastTextColor(gameState.awayColor),
                coordinates: pos != "Pitcher" ? positions[pos] : namedPositions["Pitcher"] ? positions["Pitcher"] : undefined,
            }
        ])
    ), ...Object.fromEntries(
        runningPositions.map(pos => [
            pos,
            {
                name: namedPositions[pos] ?? '',
                position: pos,
                fill: homeTeamFielding ? `#${gameState.awayColor}` : `#${gameState.homeColor}`,
                stroke: homeTeamFielding ? getContrastTextColor(gameState.awayColor) : getContrastTextColor(gameState.homeColor),
                coordinates: namedPositions[pos] ? positions[pos] : undefined,
            }
        ])
    )} as AllPlayers;

    if (gameState.phase == Phases.InningStart){

    }

    return (<>
        <DrawPlayers players={players} />
    </>);
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

function FieldBackground({ lastGameState, gameState, nextGameState, deltaTime, animationsRef, }: { lastGameState: GameState, gameState: GameState, nextGameState: GameState, deltaTime: number, animationsRef: RefObject<Animation[]> }) {
    // Code borrowed from
    // https://github.com/RangerRick/blobile
    
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
            
                <AnimationComponents prevGameState={lastGameState} gameState={gameState} nextGameState={nextGameState} deltaTime={deltaTime} animationsRef={animationsRef} />
                <GameInfo gameState={lastGameState}/>
                <InningInfo gameState={lastGameState}/>
                <MessageBox message={lastGameState.event.message} />

            </g>
        </svg>
    );
}