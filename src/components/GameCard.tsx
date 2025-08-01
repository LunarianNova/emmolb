'use client'
import { DayGame } from "@/types/DayGame";
import { GameHeader } from "./GameHeader";
import { useEffect, useState } from "react";
import { Team } from "@/types/Team";
import { CashewsGame } from "@/types/FreeCashews";

export default function GameCard({ game, killLinks = false }: {game: DayGame, killLinks?: boolean}) {
    // const [homeTeam, setHomeTeam] = useState<Team | undefined>(undefined);
    // const [awayTeam, setAwayTeam] = useState<Team | undefined>(undefined);
    // const [historicGames, setHistoricGames] = useState<CashewsGame[] | undefined>(undefined);
    
    // useEffect(() => {
    //     async function fetchHomeTeam() {
    //         setHomeTeam(await fetchTeam(game.home_team_id));
    //     }
    //     fetchHomeTeam();
    // }, [game.home_team_id])

    // useEffect(() => {
    //     async function fetchAwayTeam() {
    //         setAwayTeam(await fetchTeam(game.away_team_id));
    //     }
    //     fetchAwayTeam();
    // }, [game.away_team_id])

    // useEffect(() => {
    //     async function fetchHistoricGames() {
    //         let historicGames = await fetchTeamGames(game.home_team_id, 4);
    //         historicGames = historicGames?.filter((g: CashewsGame) => [g.away_team_id, g.home_team_id].includes(game.home_team_id) && [g.away_team_id, g.home_team_id].includes(game.away_team_id));
    //         historicGames = historicGames?.filter((g: CashewsGame) => g.state === 'Complete');
    //         setHistoricGames(historicGames);
    //     }
    //     fetchHistoricGames();
    // }, [game.home_team_id])

    return (
        <GameHeader game={game} killLinks={killLinks}/>
    )
}