import { Player } from "@/types/Player";
import { AnimatedPlayer } from "./PlayerClass";
import { Vector2 } from "@/types/Vector2";

const apiToPosition: Record<string, string> = {
    'C': 'Catcher',
    '1B': 'FirstBaseman',
    '2B': 'SecondBaseman',
    '3B': 'ThirdBaseman',
    'SS': 'Shortstop',
    'LF': 'LeftFielder',
    'CF': 'CenterFielder',
    'RF': 'RightFielder',
    'SP': 'Pitcher',
    'RP': 'Pitcher',
    'CL': 'Pitcher'
}

const fieldingPositions = [
    "FirstBaseman",
    "SecondBaseman",
    "ThirdBaseman",
    "LeftFielder",
    "CenterFielder",
    "RightFielder",
    "Shortstop",
    "Catcher",
]

export class TeamManager {
    teamName: string;
    teamColor: string;
    side: 'HOME' | 'AWAY';

    playersByPosition: Record<string, AnimatedPlayer>;
    playersByName: Record<string, AnimatedPlayer>;
    allPlayers: AnimatedPlayer[];

    currentPitcher?: AnimatedPlayer;

    batterLeft?: AnimatedPlayer;
    batterRight?: AnimatedPlayer;

    firstBaseRunner?: AnimatedPlayer;
    secondBaseRunner?: AnimatedPlayer;
    thirdBaseRunner?: AnimatedPlayer;

    constructor({teamName, teamColor, side, roster,}: {teamName: string; teamColor: string; side: 'HOME' | 'AWAY'; roster: Player[]}) {
        this.teamName = teamName;
        this.teamColor = teamColor;
        this.side = side;

        this.playersByPosition = {};
        this.playersByName = {};
        this.allPlayers = [];

        this.createPlayers(roster);
    }

    private createPlayers(roster: Player[]) {
        for (const p of roster) {
            const name = `${p.first_name} ${p.last_name}`
            const player = new AnimatedPlayer({
                teamColor: this.teamColor,
                position: apiToPosition[p.position],
                team: this.side,
                bats: p.bats as "R" | "L" | "S" ?? (Math.random() > 0.5 ? 'R' : 'L'),
                throws: p.throws as "R" | "L" | "S" ?? (Math.random() > 0.5 ? 'R' : 'L'),
                startPos: Vector2.zero(),
                name: name,
                number: p.number,
            });

            player.hide();
            this.playersByPosition[apiToPosition[p.position]] = player;
            this.playersByName[name] = player;
            this.allPlayers.push(player);
        }
    }

    startFieldingInning() {
        fieldingPositions.map((pos) => {
            this.playersByPosition[pos].walkOn();
        })
        this.currentPitcher?.show();
        this.currentPitcher?.walkOn();
    }

    endFieldingInning() {
        fieldingPositions.map((pos) => {
            this.playersByPosition[pos].walkOff();
        })
        this.currentPitcher?.walkOff();
    }

    switchPitcher(newPitcher: string) {
        this.currentPitcher?.walkOff();
        this.currentPitcher = this.playersByName[newPitcher];
        this.currentPitcher.walkOn();
    }
}