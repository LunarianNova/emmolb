// TeamManager.ts

import { Player } from "@/types/Player";
import { AnimatedPlayer } from "./PlayerClass";
import { Vector2 } from "@/types/Vector2";
import { Bases } from "@/types/Bases";
import { positions } from "./Constants";
import { Team } from "@/types/Team";

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
    team: Team;
    teamName: string;
    teamColor: string;
    side: 'HOME' | 'AWAY';

    playersByPosition: Record<string, AnimatedPlayer>;
    playersByName: Record<string, AnimatedPlayer>;
    allPlayers: AnimatedPlayer[];

    currentPitcher?: AnimatedPlayer;
    currentBatter?: AnimatedPlayer;

    firstBaseRunner?: AnimatedPlayer;
    secondBaseRunner?: AnimatedPlayer;
    thirdBaseRunner?: AnimatedPlayer;

    constructor({team, side, roster,}: {team: Team; side: 'HOME' | 'AWAY'; roster: Player[]}) {
        this.team = team;
        this.teamName = team.name;
        this.teamColor = `#${team.color}`;
        this.side = side;

        this.playersByPosition = {};
        this.playersByName = {};
        this.allPlayers = [];

        this.createPlayers(roster);
    }

    private createPlayers(roster: Player[]) {
        for (const p of roster) {
            const name = `${p.first_name} ${p.last_name}`
            const tp = this.team.players.find((tp) => tp.player_id === p.id)?.slot;
            const pos = tp ? apiToPosition[tp] : apiToPosition[p.position];
            const player = new AnimatedPlayer({
                teamColor: this.teamColor,
                position: pos,
                team: this.side,
                bats: p.bats as "R" | "L" | "S" ?? (Math.random() > 0.5 ? 'R' : 'L'),
                throws: p.throws as "R" | "L" | "S" ?? (Math.random() > 0.5 ? 'R' : 'L'),
                startPos: Vector2.zero(),
                name: name,
                number: p.number,
            });

            player.hide();
            this.playersByPosition[pos] = player;
            this.playersByName[name] = player;
            this.allPlayers.push(player);
        }
    }

    startFieldingInning() {
        fieldingPositions.map((pos) => {
            void this.playersByPosition[pos].walkOn();
        })
        this.currentPitcher?.show();
        void this.currentPitcher?.walkOn();
    }

    endFieldingInning() {
        fieldingPositions.map((pos) => {
            void this.playersByPosition[pos].walkOff();
        })
        void this.currentPitcher?.walkOff();
    }

    async switchPitcher(newPitcher: string) {
        void this.currentPitcher?.walkOff();
        this.currentPitcher = this.playersByName[newPitcher] ?? null;
        void this.currentPitcher?.walkOn('Pitcher');
    }

    hardSwitchPitcher(newPitcher: string) {
        this.currentPitcher?.hide();
        this.currentPitcher = this.playersByName[newPitcher] ?? null;
        this.currentPitcher?.show();
        this.currentPitcher?.setPosition(positions['Pitcher']);
    }

    resetPlayers(isFielding: boolean) {
        if (isFielding) {
            fieldingPositions.map((pos) => {
                const player = this.playersByPosition[pos];
                player.show();
                player.setPosition(positions[pos]);
                player.faceDirection('front');
            });
            this.currentPitcher?.show();
            this.currentPitcher?.setPosition(positions['Pitcher']);
            this.playersByPosition['Catcher'].faceDirection('back');
        }
        else {
            this.allPlayers.map((p) => p.hide());
            this.firstBaseRunner?.show();
            this.secondBaseRunner?.show();
            this.thirdBaseRunner?.show();
            this.currentBatter?.show();
            this.firstBaseRunner?.setPosition(positions['First']);
            this.secondBaseRunner?.setPosition(positions['Second']);
            this.thirdBaseRunner?.setPosition(positions['Third']);
            this.currentBatter?.setPosition(this.getBatterPosition().position);
            this.firstBaseRunner?.faceDirection('front');
            this.secondBaseRunner?.faceDirection('front');
            this.thirdBaseRunner?.faceDirection('front');
            this.currentBatter?.faceDirection("back");
        }
    }

    getBatterPosition(): {label: string, position: Vector2} {
        if (this.currentBatter?.bats === 'R') return {label: 'RightHandedBatter', position: positions['RightHandedBatter']};
        else if (this.currentBatter?.bats === 'L') return {label: 'LeftHandedBatter', position: positions['LeftHandedBatter']};
        else return Math.random() >= 0.5 ? {label: 'RightHandedBatter', position: positions['RightHandedBatter']} : {label: 'LeftHandedBatter', position: positions['LeftHandedBatter']}; 
    }

    setBases(bases: Bases) {
        this.firstBaseRunner = bases.first ? this.playersByName[bases.first] : undefined;
        this.secondBaseRunner = bases.second ? this.playersByName[bases.second] : undefined;
        this.thirdBaseRunner = bases.third ? this.playersByName[bases.third] : undefined;
    }

    async switchBatter(newBatter: string) {
        console.log(this.currentBatter);
        void this.currentBatter?.walkOff();
        this.currentBatter = this.playersByName[newBatter] ?? null;
        console.log(this.currentBatter);

        const pos = this.getBatterPosition();
        await this.currentBatter?.walkOn(pos.label);
        this.currentBatter?.faceDirection("back");
    }

    hardSwitchBatter(newBatter: string) {
        this.currentBatter?.hide();
        this.currentBatter = this.playersByName[newBatter] ?? null;

        const pos = this.getBatterPosition();
        this.currentBatter?.setPosition(pos.position);
        this.currentBatter?.faceDirection("back");
    }
}