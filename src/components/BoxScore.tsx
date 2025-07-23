'use client'
import React from 'react'
import { WeatherInfo } from './WeatherInfo'
import { useRouter } from 'next/navigation'
import { getContrastTextColor } from '@/helpers/Colors'
import { Team } from '@/types/Team'
import { Game } from '@/types/Game'
import { Event } from '@/types/Event'
import { GameStats } from '@/types/GameStats'

interface BoxScoreProps {
    gameStats: GameStats
    team: Team
    isAway: boolean
}

export function BoxScore({ gameStats, team, isAway }: BoxScoreProps) {
    return (
        <div>
            <div style={{ backgroundColor: "#" + team.color, color: getContrastTextColor(team.color) || 'rgb(0,0,0)' }}>{team.location} {team.name}</div>
            <table>
                <thead>
                    <tr>
                        <th className="p-1">Batting</th>
                        <th className="p-1">AB</th>
                        <th className="p-1">H</th>
                        <th className="p-1">R</th>
                        <th className="p-1">HR</th>
                        <th className="p-1">RBI</th>
                    </tr>
                </thead>
                <tbody>
                    {(isAway ? gameStats.away : gameStats.home).battingOrder.map(batter =>
                        <tr>
                            <td className="p-1">{batter}</td>
                            <td className="p-1">{gameStats.batters[batter].atBats}</td>
                            <td className="p-1">{gameStats.batters[batter].hits}</td>
                            <td className="p-1">{gameStats.batters[batter].runs}</td>
                            <td className="p-1">{gameStats.batters[batter].homeRuns}</td>
                            <td className="p-1">{gameStats.batters[batter].rbi}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <table>
                <thead>
                    <tr>
                        <th className="p-1">Pitching</th>
                        <th className="p-1">IP</th>
                        <th className="p-1">ER</th>
                        <th className="p-1">H</th>
                        <th className="p-1">BB</th>
                        <th className="p-1">K</th>
                        <th className="p-1">PC</th>
                        <th className="p-1">ST</th>
                    </tr>
                </thead>
                <tbody>
                    {(isAway ? gameStats.away : gameStats.home).pitchingOrder.map(pitcher =>
                        <tr>
                            <td className="p-1">{pitcher}</td>
                            <td className="p-1">{Math.floor(gameStats.pitchers[pitcher].outsRecorded/3)}.{gameStats.pitchers[pitcher].outsRecorded%3}</td>
                            <td className="p-1">{gameStats.pitchers[pitcher].earnedRuns}</td>
                            <td className="p-1">{gameStats.pitchers[pitcher].hits}</td>
                            <td className="p-1">{gameStats.pitchers[pitcher].walks}</td>
                            <td className="p-1">{gameStats.pitchers[pitcher].strikeouts}</td>
                            <td className="p-1">{gameStats.pitchers[pitcher].pitchCount}</td>
                            <td className="p-1">{gameStats.pitchers[pitcher].strikesThrown}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
