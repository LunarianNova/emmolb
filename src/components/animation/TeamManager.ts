// TeamManager.ts

import { Player } from "@/types/Player";
import { AnimatedPlayer } from "./PlayerClass";
import { Vector2 } from "@/types/Vector2";
import { Bases } from "@/types/Bases";
import { positions } from "./Constants";

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
    currentBatter?: AnimatedPlayer;

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
        this.currentPitcher = this.playersByName[newPitcher] ?? null;
        this.currentPitcher?.walkOn();
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
                player.turnAround('front');
            });
            this.currentPitcher?.show();
            this.currentPitcher?.setPosition(positions['Pitcher']);
            this.playersByPosition['Catcher'].turnAround('back');
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
            this.firstBaseRunner?.turnAround('front');
            this.secondBaseRunner?.turnAround('front');
            this.thirdBaseRunner?.turnAround('front');
            this.currentBatter?.turnAround("back");
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
        this.currentBatter?.walkOff();
        this.currentBatter = this.playersByName[newBatter] ?? null;

        const pos = this.getBatterPosition();
        await this.currentBatter?.walkOn(pos.label);
        this.currentBatter?.turnAround("back");
    }

    hardSwitchBatter(newBatter: string) {
        this.currentBatter?.hide();
        this.currentBatter = this.playersByName[newBatter] ?? null;

        const pos = this.getBatterPosition();
        this.currentBatter?.setPosition(pos.position);
        this.currentBatter?.turnAround("back");
    }
}