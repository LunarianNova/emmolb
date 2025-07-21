'use client'
import { useEffect, useRef, useState } from "react";
import { Scoreboard } from "./Scoreboard";
import { Announcer } from "./Announcer";
import { Vector2 } from "@/types/Vector2";
import { Team } from "@/types/Team";
import { Game } from "@/types/Game";
import Field from "./Field";
import GameInfo from "./GameInfo";
import { Event } from "@/types/Event";
import Loading from "../Loading";
import { usePolling } from "@/hooks/Poll";
import { Player } from "./PlayerClass";
import { positions } from "./Constants";

function createPlayersForPositions(team: 'HOME' | 'AWAY', teamColor: string): Player[] {
    const pos = ['Pitcher', 'FirstBaseman', 'SecondBaseman', 'ThirdBaseman', 'Shortstop', 'CenterFielder', 'LeftFielder', 'RightFielder']
    return pos.map((positionName, i) => {
        const p =new Player({
            teamColor,
            position: positionName,
            team,
            bats: Math.random() > 0.5 ? 'R' : 'L',
            throws: Math.random() > 0.5 ? 'R' : 'L',
            startPos: Vector2.zero(),
            name: `${positionName}`,
        });
        p.hide();
        return p;
    });
}

export default function GameField({homeTeam, awayTeam, game, id,}: {homeTeam: Team; awayTeam: Team; game: Game; id: string;}) {
    const svgRef = useRef<SVGSVGElement>(null);

    const [eventLog, setEventLog] = useState<Event[]>(game.event_log);

    useEffect(() => {
        if (!svgRef.current) return;

        // Clear previous announcer if any
        const existing = svgRef.current.querySelector("#Announcer");
        if (existing) return;

        const players = createPlayersForPositions('AWAY', '#ba56cd');
        players.forEach(p => {
            svgRef.current?.appendChild(p.group);
            p.walkOn();
            setTimeout(() => {p.walkOff();},10000)
        });

        // Instantiate announcer class and mount it
        const announcer = new Announcer({position: new Vector2(-180, 490)});
        svgRef.current.appendChild(announcer.group);
        announcer.startBlinking();
        announcer.sayMessage("Today's game is looking like a good one. If only my programmers would actually make the game live! But they're too busy redesigning me!");
    }, []);

    usePolling({
        interval: 6000,
        pollFn: async () => {
            const after = (eventLog.length).toString();
            const res = await fetch(`/nextapi/game/${id}/live?after=${after}`);
            if (!res.ok) throw new Error("Failed to fetch events");
            return res.json();
        },
        onData: (newData) => {
            if (newData.entries?.length) {
                setEventLog(prev => ([...prev, ...newData.entries]));
            }
        },
        shouldStop: (newData) => {
                if (game.state === 'Complete') return true;
            const last = newData.entries?.[newData.entries.length - 1];
            return last?.event === "Recordkeeping";
        }
    });

    if (!eventLog || eventLog.length === 0) return (<Loading />)

    const lastEvent = eventLog[eventLog.length-1];

    return (
        <svg ref={svgRef} id={id} width="100%" height="100vh" viewBox="-200 0 1200 600" style={{ background: "#242424" }}>
            <Field />
            <GameInfo homeTeam={homeTeam} awayTeam={awayTeam} stadium={homeTeam.ballpark_name ?? ''} />
            <Scoreboard position={new Vector2(-180, 20)} titles={["AWAY", "INNG", "HOME"]} values={[String(lastEvent.away_score), lastEvent.event === 'Recordkeeping' ? 'FIN' : `${lastEvent.inning_side === 0 ? "▲" : "▼"}${lastEvent.inning}`, String(lastEvent.home_score)]}/>
            <Scoreboard position={new Vector2(-60, 20)} titles={["BALL", "STRK", "OUT"]} values={[String(lastEvent.balls ?? '-'), String(lastEvent.strikes ?? '-'), String(lastEvent.outs ?? '-')]}/>
        </svg>
    );
}
