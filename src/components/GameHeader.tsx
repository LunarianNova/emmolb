'use client'

import React from 'react'
import { WeatherInfo } from './WeatherInfo'
import { useRouter } from 'next/navigation'

interface Team {
  id: string
  name: string
  score: number
  emoji: string
  wins: number
  losses: number
  runDiff: number
  color: string
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
  killLinks?: boolean
}

interface GameHeaderResponse {
  homeTeam: any
  awayTeam: any
  game: any
  killLinks?: boolean
}

function getLuminance(hex: string): number {
  const c = hex.charAt(0) === '#' ? hex.substring(1) : hex;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const [R, G, B] = [r, g, b].map((ch) =>
    ch <= 0.03928 ? ch / 12.92 : Math.pow((ch + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastTextColor(bgHex: string): 'black' | 'white' {
  const luminance = getLuminance(bgHex);
  return luminance > 0.179 ? 'black' : 'white';
}

export function GameHeaderFromResponse({ homeTeam, awayTeam, game, killLinks = false}: GameHeaderResponse) {
  const lastEvent = game.EventLog[game.EventLog.length - 1];
  const homeTeamParam = {
    id : homeTeam._id,
    name: `${homeTeam.Location} ${homeTeam.Name}`,
    score: lastEvent.home_score,
    emoji: homeTeam.Emoji,
    wins: homeTeam.Record["Regular Season"].Wins,
    losses: homeTeam.Record["Regular Season"].Losses,
    runDiff: homeTeam.Record["Regular Season"].RunDifferential,
    color: homeTeam.Color
  };
  const awayTeamParam = {
    id: awayTeam._id,
    name: `${awayTeam.Location} ${awayTeam.Name}`,
    score: lastEvent.away_score,
    emoji: awayTeam.Emoji,
    wins: awayTeam.Record["Regular Season"].Wins,
    losses: awayTeam.Record["Regular Season"].Losses,
    runDiff: awayTeam.Record["Regular Season"].RunDifferential,
    color: awayTeam.Color
  };
  const centerParam = {
    icon: game.Weather.Emoji,
    title: game.Weather.Name,
    subtitle: game.Weather.Tooltip
  };
  const inningParam = game.State != "Complete" ? (lastEvent.inning_side === 1 ? 'BOT' : 'TOP') + ' ' + lastEvent.inning : "FINAL"

  return GameHeader({homeTeam: homeTeamParam, awayTeam: awayTeamParam, center: centerParam, inning: inningParam, killLinks: killLinks})
}

export function GameHeader({ homeTeam, awayTeam, center, inning, killLinks = false }: GameHeaderProps) {
  const router = useRouter();
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
          style={{ color: getContrastTextColor(awayTeam.color) || 'rgb(0,0,0)' }}
        >
          <div className="text-xl md:text-3xl font-bold md:mr-2 min-w-[2rem] text-center">
            {awayTeam.score}
          </div>
          <div className="text-xl md:text-4xl">{awayTeam.emoji}</div>
          <div className="text-xs md:text-xl font-semibold whitespace-normal leading-snug text-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (!killLinks) router.push(`/team/${awayTeam.id}`);
          }}>
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
                <div className="text-base md:text-lg font-bold leading-tight">
                    {inning}
                </div>
            </div>
        </div>

        {/* Home Team */}
        <div
          className="flex items-center justify-end px-1 py-2 min-h-[54px] md:min-h-[88px]"
          style={{ color: getContrastTextColor(awayTeam.color) || 'rgb(0,0,0)' }}
        >
          <div className="text-xs md:text-xl font-semibold whitespace-normal leading-snug text-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (!killLinks) router.push(`/team/${homeTeam.id}`);
          }}>
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
