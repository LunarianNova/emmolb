'use client'

import React from 'react'
import { WeatherInfo } from './WeatherInfo'

interface Team {
  name: string
  score: number
  emoji: string
  wins: number
  losses: number
  runDiff: number
  color: string
  textColor?: string
}

interface CenterInfo {
  icon: string
  title: string
  subtitle: string
}

interface GameHeaderProps {
  homeTeam: Team
  awayTeam: Team
  center: CenterInfo
  inning: string
}

export function GameHeader({ homeTeam, awayTeam, center, inning }: GameHeaderProps) {
  return (
    <div
      className="rounded-xl shadow-xl overflow-visible mb-6 border-3 border-[#0c111b]"
      style={{
        background:
          `linear-gradient(60deg, #${awayTeam.color} 36%, rgb(12, 17, 27) 50%, rgb(12, 17, 27) 50%, #${homeTeam.color} 64%)`,
      }}
    >
      <div className="grid grid-cols-[minmax(100px,1fr)_auto_minmax(100px,1fr)] items-center gap-x-2 px-2 py-3 w-full">
        {/* Away Team */}
        <div
          className="flex items-center px-1 py-2 min-h-[54px] md:min-h-[88px]"
          style={{ color: awayTeam.textColor || 'rgb(0,0,0)' }}
        >
          <div className="text-xl md:text-3xl font-bold md:mr-2 min-w-[2rem] text-center">
            {awayTeam.score}
          </div>
          <div className="text-xl md:text-4xl">{awayTeam.emoji}</div>
          <div className="text-xs md:text-xl font-semibold whitespace-nowrap leading-snug text-center cursor-pointer ml-1">
            {awayTeam.name}
            <div className="text-[10px] md:text-sm font-normal mt-0.5 opacity-70">
              {awayTeam.wins}–{awayTeam.losses} (
                {awayTeam.runDiff >= 0 ? '+' : ''}
                {awayTeam.runDiff}
              )
            </div>
          </div>
        </div>

        {/* Center Info */}
        <div className="flex items-center justify-center px-4 text-white text-center min-h-[54px] md:min-h-[88px] relative">
            <div className="flex flex-col items-center justify-center gap-1">
                <WeatherInfo
                    emoji={center.icon}
                    title={center.title}
                    description={center.subtitle}
                    />
                {/* Inning info below weather */}
                <div className="text-sm md:text-base font-semibold mt-1 select-none">
                    {inning}
                </div>
            </div>
        </div>

        {/* Home Team */}
        <div
          className="flex items-center justify-end px-1 py-2 min-h-[54px] md:min-h-[88px]"
          style={{ color: homeTeam.textColor || 'rgb(0,0,0)' }}
        >
          <div className="text-xs md:text-xl font-semibold whitespace-nowrap leading-snug text-center cursor-pointer mr-1">
            {homeTeam.name}
            <div className="text-[10px] md:text-sm font-normal mt-0.5 opacity-70">
              {homeTeam.wins}–{homeTeam.losses} (
                {homeTeam.runDiff >= 0 ? '+' : ''}
                {homeTeam.runDiff}
              )
            </div>
          </div>
          <div className="text-xl md:text-4xl">{homeTeam.emoji}</div>
          <div className="text-xl md:text-3xl font-bold md:ml-2 min-w-[2rem] text-center">
            {homeTeam.score}
          </div>
        </div>
      </div>
    </div>
  )
}
