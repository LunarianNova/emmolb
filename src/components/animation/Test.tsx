'use client'
import { useEffect, useRef } from "react";
import { Scoreboard } from "./Scoreboard";
import { Announcer } from "./Announcer";
import { Vector2 } from "@/types/Vector2";
import { Team } from "@/types/Team";
import { Game } from "@/types/Game";
import Field from "./Field";
import GameInfo from "./GameInfo";

export default function GameField({homeTeam, awayTeam, game, id,}: {homeTeam: Team; awayTeam: Team; game: Game; id: string;}) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        // Clear previous announcer if any
        const existing = svgRef.current.querySelector("#Announcer");
        if (existing) existing.remove();

        // Instantiate announcer class and mount it
        const announcer = new Announcer({position: new Vector2(-180, 490)});
        svgRef.current.appendChild(announcer.group);
        announcer.startBlinking();
        announcer.sayMessage("Today's game is looking like a good one. If only my programmers would actually make the game live! But they're too busy redesigning me!");
    }, []);

    const lastEvent = game.event_log[game.event_log.length - 1];

    return (
        <svg ref={svgRef} id={id} width="100%" height="100vh" viewBox="-200 0 1200 600" style={{ background: "#242424" }}>
            <Field />
            <GameInfo homeTeam={homeTeam} awayTeam={awayTeam} stadium={homeTeam.ballpark_name ?? ''} />
            <Scoreboard position={new Vector2(-180, 20)} titles={["AWAY", "INNG", "HOME"]} values={[String(lastEvent.away_score), game.state === 'Complete' ? 'FIN' : `${lastEvent.inning_side === 0 ? "▲" : "▼"}${lastEvent.inning}`, String(lastEvent.home_score)]}/>
            <Scoreboard position={new Vector2(-60, 20)} titles={["BALL", "STRK", "OUT"]} values={[String(lastEvent.balls ?? '-'), String(lastEvent.strikes ?? '-'), String(lastEvent.outs ?? '-')]}/>
        </svg>
    );
}
