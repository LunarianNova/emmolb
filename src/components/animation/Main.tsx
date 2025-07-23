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
import { MapAPIPlayerResponse, Player } from "@/types/Player";
import { Navbar } from "../Navbar";
import { TeamManager } from "./TeamManager";
import { GameManager } from "./GameManager";
import AnimationControls from "./Controls";

export default function GameField({homeTeam, awayTeam, game, id,}: {homeTeam: Team; awayTeam: Team; game: Game; id: string;}) {
    const svgRef = useRef<SVGSVGElement>(null);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [lastEvent, setLastEvent] = useState<Event | null>(null);
    const [gameManager, setGameManager] = useState<GameManager>();
    const [eventLog, setEventLog] = useState<Event[]>(game.event_log);
    const [players, setPlayers] = useState<Player[]>([]);

    const playerIds = useMemo(() => {
        const ids: string[] = [];

        for (const p of homeTeam.players) ids.push(p.player_id);
        for (const p of awayTeam.players) ids.push(p.player_id);

        for (const teamId of Object.keys(game.stats)) {
            for (const playerId of Object.keys(game.stats[teamId])) {
                ids.push(playerId);
            }
        }

        const seen: Record<string, boolean> = {};
        const uniqueIds: string[] = [];
        for (const id of ids) {
            if (!seen[id]) {
                seen[id] = true;
                uniqueIds.push(id);
            }
        }

        return uniqueIds;
    }, [homeTeam.players, awayTeam.players, game]);

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
        const homeTeamManager = new TeamManager({teamName: homeTeam.name, teamColor: `#${homeTeam.color}`, side: 'HOME', roster: players.filter((p) => homeTeam.players.find((tp) => tp.player_id === p.id) || Object.keys(game.stats[homeTeam.id]).includes(p.id))});
        const awayTeamManager = new TeamManager({teamName: awayTeam.name, teamColor: `#${awayTeam.color}`, side: 'AWAY', roster: players.filter((p) => awayTeam.players.find((tp) => tp.player_id === p.id) || Object.keys(game.stats[awayTeam.id]).includes(p.id))});
        homeTeamManager.allPlayers.map((p) => svgRef.current!.appendChild(p.group))
        awayTeamManager.allPlayers.map((p) => svgRef.current!.appendChild(p.group))
        svgRef.current.appendChild(announcer.group);

        const gameManager = new GameManager({homeTeam: homeTeamManager, awayTeam: awayTeamManager, announcer, eventLog, game, svgRef});
        setGameManager(gameManager);
        setIsPlaying(true);
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
                setEventLog(prev => {
                    const updated = [...prev, ...newData.entries];
                    if (gameManager) gameManager.updateEventLog(updated);
                    return updated;
                });
            }
        },
        shouldStop: (newData) => {
            if (game.state === 'Complete') return true;
            const last = newData.entries?.[newData.entries.length - 1];
            return last?.event === "Recordkeeping";
        },
        killCon: () => {
            return eventLog[eventLog.length - 1].event === 'Recordkeeping';
        }
    });

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        function fetchLastEvent() {
            if (gameManager) setLastEvent(eventLog[gameManager.getEventIndex()-1] ?? eventLog[0]); // Fetch first on fallback because otherwise it'll show way later data
            else setLastEvent(eventLog[eventLog.length - 1]);

            timeout = setTimeout(fetchLastEvent, 100);
        }

        fetchLastEvent();
        return () => clearTimeout(timeout);
    }, [gameManager, eventLog]);

    if (!eventLog || eventLog.length === 0 || players.length === 0) return (<><Navbar /><Loading /></>)

    return (
        <svg ref={svgRef} id={id} width="100%" height="100vh" viewBox="-200 0 1200 600" style={{ background: "#242424" }}>
            <Field />

            <AnimationControls 
                onRewind={() => {
                    gameManager?.skipTo(gameManager.getEventIndex()-1);
                    setIsPlaying(gameManager?.getIsPlaying() ?? false);
                }}
                onPause={() => {
                    gameManager?.togglePause(); 
                    setIsPlaying(gameManager?.getIsPlaying() ?? false);
                }} 
                onForward={() => {
                    gameManager?.skipTo(gameManager.getEventIndex()+1);
                    setIsPlaying(gameManager?.getIsPlaying() ?? false);
                }} 
                isPaused={!isPlaying}
            />

            <GameInfo homeTeam={homeTeam} awayTeam={awayTeam} stadium={homeTeam.ballpark_name ?? ''} />
            {lastEvent && (<>
                <Scoreboard position={new Vector2(-180, 20)} titles={["AWAY", "INNG", "HOME"]} values={[String(lastEvent.away_score), lastEvent.event === 'Recordkeeping' ? 'FIN' : `${lastEvent.inning_side === 0 ? "▲" : "▼"}${lastEvent.inning}`, String(lastEvent.home_score)]}/>
                <Scoreboard position={new Vector2(-60, 20)} titles={["BALL", "STRK", "OUT"]} values={[String(lastEvent.balls ?? '-'), String(lastEvent.strikes ?? '-'), String(lastEvent.outs ?? '-')]}/>
            </>)}
        </svg>
    );
}
