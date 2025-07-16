'use client'
import React from 'react'
import { WeatherInfo } from './WeatherInfo'
import { useRouter } from 'next/navigation'
import { getContrastTextColor } from '@/helpers/Colors'
import { Team } from '@/types/Team'
import { Game } from '@/types/Game'
import { Event } from '@/types/Event'

interface GameHeaderProps {
    homeTeam: Team
    awayTeam: Team
    game: Game
    killLinks?: boolean
}

interface GameHeaderEventProps {
    homeTeam: Team
    awayTeam: Team
    game: Game
    event: Event
    killLinks?: boolean
}

export function GameHeader({ homeTeam, awayTeam, game, killLinks = false }: GameHeaderProps) {
    const router = useRouter();
    const lastEvent = game.event_log[game.event_log.length - 1];

    return (
        <div className="rounded-xl shadow-xl overflow-visible mb-6 border-3 border-theme-accent" style={{background: `linear-gradient(60deg, #${awayTeam.color} 36%, rgb(12, 17, 27) 50%, rgb(12, 17, 27) 50%, #${homeTeam.color} 64%)`}}>
            <div className="grid grid-cols-[minmax(100px,1fr)_auto_minmax(100px,1fr)] items-center gap-x-2 px-2 py-3 w-full">
                <div className="flex items-center px-1 py-2 min-h-[54px] md:min-h-[88px]" style={{ color: getContrastTextColor(awayTeam.color) || 'rgb(0,0,0)' }}>
                    <div className="text-xl md:text-3xl font-bold md:mr-2 min-w-[2rem] text-center">
                        {lastEvent.away_score}
                    </div>
                    <div className="text-xl md:text-4xl">
                        {awayTeam.emoji}
                    </div>
                    <div className="text-xs md:text-xl font-semibold whitespace-normal leading-snug text-center cursor-pointer" onClick={(e) => {e.stopPropagation(); if (!killLinks) router.push(`/team/${awayTeam.id}`);}}>
                        {awayTeam.location} {awayTeam.name}
                        <div className="text-[10px] md:text-sm font-normal mt-0.5 opacity-70">
                            {awayTeam.record.regular_season.wins}–{awayTeam.record.regular_season.losses} ({awayTeam.record.regular_season.run_differential >= 0 ? '+' : ''}{awayTeam.record.regular_season.run_differential})
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center px-4 text-white text-center min-h-[54px] md:min-h-[88px] relative">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <WeatherInfo weather={game.weather} />
                        <div className="text-base text-white md:text-lg font-bold leading-tight">
                            {game.state !== "Complete" ? (lastEvent.inning_side === 1 ? "BOT " : "TOP ") + lastEvent.inning : "FINAL"}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end px-1 py-2 min-h-[54px] md:min-h-[88px]" style={{ color: getContrastTextColor(homeTeam.color) || 'rgb(0,0,0)' }}>
                    <div className="text-xs md:text-xl font-semibold whitespace-normal leading-snug text-center cursor-pointer" onClick={(e) => {e.stopPropagation(); if (!killLinks) router.push(`/team/${homeTeam.id}`);}}>
                        {homeTeam.location} {homeTeam.name}
                        <div className="text-[10px] md:text-sm font-normal mt-0.5 opacity-70">
                            {homeTeam.record.regular_season.wins}–{homeTeam.record.regular_season.losses} ({homeTeam.record.regular_season.run_differential >= 0 ? '+' : ''}{homeTeam.record.regular_season.run_differential})
                        </div>
                    </div>
                    <div className="text-xl md:text-4xl">
                        {homeTeam.emoji}
                    </div>
                    <div className="text-xl md:text-3xl font-bold md:ml-2 min-w-[2rem] text-center">
                        {lastEvent.home_score}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function GameHeaderEvent({ homeTeam, awayTeam, game, event, killLinks = false }: GameHeaderEventProps) {
    const router = useRouter();

    return (
        <div className="rounded-xl shadow-xl overflow-visible mb-6 border-3 border-theme-accent" style={{background: `linear-gradient(60deg, #${awayTeam.color} 36%, rgb(12, 17, 27) 50%, rgb(12, 17, 27) 50%, #${homeTeam.color} 64%)`}}>
            <div className="grid grid-cols-[minmax(100px,1fr)_auto_minmax(100px,1fr)] items-center gap-x-2 px-2 py-3 w-full">
                <div className="flex items-center px-1 py-2 min-h-[54px] md:min-h-[88px]" style={{ color: getContrastTextColor(awayTeam.color) || 'rgb(0,0,0)' }}>
                    <div className="text-xl md:text-3xl font-bold md:mr-2 min-w-[2rem] text-center">
                        {event.away_score}
                    </div>
                    <div className="text-xl md:text-4xl">
                        {awayTeam.emoji}
                    </div>
                    <div className="text-xs md:text-xl font-semibold whitespace-normal leading-snug text-center cursor-pointer" onClick={(e) => {e.stopPropagation(); if (!killLinks) router.push(`/team/${awayTeam.id}`);}}>
                        {awayTeam.location} {awayTeam.name}
                        <div className="text-[10px] md:text-sm font-normal mt-0.5 opacity-70">
                            {awayTeam.record.regular_season.wins}–{awayTeam.record.regular_season.losses} ({awayTeam.record.regular_season.run_differential >= 0 ? '+' : ''}{awayTeam.record.regular_season.run_differential})
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center px-4 text-white text-center min-h-[54px] md:min-h-[88px] relative">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <WeatherInfo weather={game.weather} />
                        <div className="text-base text-white md:text-lg font-bold leading-tight">
                            {game.state !== "Complete" ? (event.inning_side === 1 ? "BOT " : "TOP ") + event.inning : "FINAL"}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end px-1 py-2 min-h-[54px] md:min-h-[88px]" style={{ color: getContrastTextColor(homeTeam.color) || 'rgb(0,0,0)' }}>
                    <div className="text-xs md:text-xl font-semibold whitespace-normal leading-snug text-center cursor-pointer" onClick={(e) => {e.stopPropagation(); if (!killLinks) router.push(`/team/${homeTeam.id}`);}}>
                        {homeTeam.location} {homeTeam.name}
                        <div className="text-[10px] md:text-sm font-normal mt-0.5 opacity-70">
                            {homeTeam.record.regular_season.wins}–{homeTeam.record.regular_season.losses} ({homeTeam.record.regular_season.run_differential >= 0 ? '+' : ''}{homeTeam.record.regular_season.run_differential})
                        </div>
                    </div>
                    <div className="text-xl md:text-4xl">
                        {homeTeam.emoji}
                    </div>
                    <div className="text-xl md:text-3xl font-bold md:ml-2 min-w-[2rem] text-center">
                        {event.home_score}
                    </div>
                </div>
            </div>
        </div>
    )
}
