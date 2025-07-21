'use client'
import { useEffect, useMemo, useRef, useState } from "react";
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
import { AnimatedPlayer } from "./PlayerClass";
import { positions } from "./Constants";
import { MapAPIPlayerResponse, Player } from "@/types/Player";
import { Navbar } from "../Navbar";
import { TeamManager } from "./TeamManager";
import { GameManager } from "./GameManager";

function createPlayersForPositions(team: 'HOME' | 'AWAY', teamColor: string): AnimatedPlayer[] {
    const pos = ['Pitcher', 'FirstBaseman', 'SecondBaseman', 'ThirdBaseman', 'Shortstop', 'CenterFielder', 'LeftFielder', 'RightFielder']
    return pos.map((positionName, i) => {
        const p =new AnimatedPlayer({
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

    const [gameManager, setGameManager] = useState<GameManager>();
    const [eventLog, setEventLog] = useState<Event[]>(game.event_log);
    const [players, setPlayers] = useState<Player[]>([]);

    const playerIds = useMemo(
        () => [
            ...homeTeam.players.map((p) => p.player_id),
            ...awayTeam.players.map((p) => p.player_id),
        ],
        [homeTeam.players, awayTeam.players]
    );

    useEffect(() => {
        if (playerIds.length === 0) return;
        async function api() {
            const playersRes = await fetch(`/nextapi/players?ids=${playerIds.join(',')}`);
            if (!playersRes.ok) throw new Error('Failed to load player data');
            const response = await playersRes.json();
            const players: Player[] = response.players.map((p: any) => (MapAPIPlayerResponse(p)));
            setPlayers(players);
        }

        api();
    }, [playerIds])

    useEffect(() => {
        if (!svgRef.current || players.length === 0 || eventLog.length === 0) return;

        const rerun = svgRef.current.querySelector("#Announcer");
        if (rerun) return;

        const announcer = new Announcer({ position: new Vector2(-180, 490) });
        const homeTeamManager = new TeamManager({teamName: homeTeam.name, teamColor: `#${homeTeam.color}`, side: 'HOME', roster: players.filter((p) => p.team_id === homeTeam.id)});
        const awayTeamManager = new TeamManager({teamName: awayTeam.name, teamColor: `#${awayTeam.color}`, side: 'AWAY', roster: players.filter((p) => p.team_id === awayTeam.id)});
        homeTeamManager.allPlayers.map((p) => svgRef.current!.appendChild(p.group))
        awayTeamManager.allPlayers.map((p) => svgRef.current!.appendChild(p.group))
        svgRef.current.appendChild(announcer.group);

        const gameManager = new GameManager({homeTeam: homeTeamManager, awayTeam: awayTeamManager, announcer, eventLog, game})
        setGameManager(gameManager);
        gameManager.start();

    }, [players, eventLog, homeTeam, awayTeam, game]);


    usePolling({
        interval: 6000,
        pollFn: async () => {
            const after = (eventLog.length+1).toString();
            const res = await fetch(`/nextapi/game/${id}/live?after=${after}`);
            if (!res.ok) throw new Error("Failed to fetch events");
            return res.json();
        },
        onData: (newData) => {
            if (newData.entries?.length) {
                setEventLog(prev => ([...prev, ...newData.entries]));
                if (gameManager) gameManager.updateEventLog(eventLog);
            }
        },
        shouldStop: (newData) => {
                if (game.state === 'Complete') return true;
            const last = newData.entries?.[newData.entries.length - 1];
            return last?.event === "Recordkeeping";
        }
    });

    if (!eventLog || eventLog.length === 0 || players.length === 0) return (<><Navbar /><Loading /></>)

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
