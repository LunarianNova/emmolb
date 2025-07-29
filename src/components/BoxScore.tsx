'use client'
import React from 'react'
import { getContrastTextColor } from '@/helpers/ColorHelper'
import { Team } from '@/types/Team'
import { GameStats } from '@/types/GameStats'

interface BoxScoreProps {
    gameStats: GameStats
    team: Team
    isAway: boolean
}

export function BoxScore({ gameStats, team, isAway }: BoxScoreProps) {
    return (
        <div className='relative'>
            <div className='absolute -top-3 left-3 z-10 inline-block rounded-full px-3 py-1 text-base font-bold text-theme-secondary border border-theme-accent shadow-md' style={{ background: `#${team.color}`, borderColor: getContrastTextColor(team.color), color: getContrastTextColor(team.color) }}>
                {team.emoji && <span className="mr-1">{team.emoji}</span>} {team.name}
            </div>
            <div className="rounded-md pt-6 p-3 mt-4" style={{ background: 'var(--theme-primary)' }}>
                <table className='table table-auto w-full mt-2'>
                    <thead className='table-header-group'>
                        <tr className='table-row border-b-1 border-(--theme-text)/50 font-semibold text-xs uppercase'>
                            <td className='table-cell text-left'>Batting</td>
                            <td className='table-cell text-right min-w-7'>AB</td>
                            <td className='table-cell text-right min-w-7'>H</td>
                            <td className='table-cell text-right min-w-7'>R</td>
                            <td className='table-cell text-right min-w-7'>HR</td>
                            <td className='table-cell text-right min-w-7'>RBI</td>
                        </tr>
                    </thead>
                    <tbody className='table-row-group'>
                        {(isAway ? gameStats.away : gameStats.home).battingOrder.map(batter =>
                            <tr key={batter} className='table-row border-b-1 border-(--theme-text)/50 text-sm'>
                                <td className='table-cell text-left'>{batter}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.batters[batter].atBats}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.batters[batter].hits}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.batters[batter].runs}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.batters[batter].homeRuns}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.batters[batter].rbi}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <table className='table table-auto w-full mt-2'>
                    <thead className='table-header-group'>
                        <tr className='table-row font-semibold text-xs uppercase'>
                            <th className='table-cell text-left'>Pitching</th>
                            <th className='table-cell text-right min-w-5'>IP</th>
                            <th className='table-cell text-right min-w-5'>ER</th>
                            <th className='table-cell text-right min-w-5'>H</th>
                            <th className='table-cell text-right min-w-5'>BB</th>
                            <th className='table-cell text-right min-w-5'>K</th>
                            <th className='table-cell text-right min-w-5'>PC</th>
                            <th className='table-cell text-right min-w-5'>ST</th>
                        </tr>
                    </thead>
                    <tbody className='table-row-group'>
                        {(isAway ? gameStats.away : gameStats.home).pitchingOrder.map(pitcher =>
                            <tr key={pitcher} className='table-row border-t-1 border-(--theme-text)/50 text-sm'>
                                <td className='table-cell text-left'>{pitcher}</td>
                                <td className='table-cell text-right pl-3'>{Math.floor(gameStats.pitchers[pitcher].outsRecorded / 3)}.{gameStats.pitchers[pitcher].outsRecorded % 3}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.pitchers[pitcher].earnedRuns}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.pitchers[pitcher].hits}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.pitchers[pitcher].walks}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.pitchers[pitcher].strikeouts}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.pitchers[pitcher].pitchCount}</td>
                                <td className='table-cell text-right pl-3'>{gameStats.pitchers[pitcher].strikesThrown}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
