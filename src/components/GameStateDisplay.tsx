'use client'

import React from 'react'

type PlayerInfo = {
  name: string
  stat: string // ERA or BA
  onClick?: () => void;
}

type GameStateDisplayProps = {
  balls: number
  strikes: number
  outs: number
  bases: {
    first: boolean
    second: boolean
    third: boolean
  }
  pitcher: PlayerInfo
  batter: PlayerInfo
  onDeck: PlayerInfo
}

export function GameStateDisplay({
  balls,
  strikes,
  outs,
  bases,
  pitcher,
  batter,
  onDeck,
}: GameStateDisplayProps) {
  const renderCircles = (count: number, max: number) =>
    Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={`w-4 h-4 rounded-full border ${
          i < count ? 'bg-theme-text' : 'bg-transparent'
        }`}
      />
    ))

  const baseStyles = (active: boolean) =>
    `absolute w-10 h-10 rotate-45 transition-opacity duration-500 ${
      active ? 'opacity-90 bg-white' : 'opacity-15 bg-white'
    }`

  const PlayerDisplay = ({ label, player }: { label: string; player: PlayerInfo }) => (
    <div className="max-w-full sm:max-w-none">
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide opacity-70 leading-tight">
        {label}
      </div>
      <div className="text-[13px] sm:text-sm flex flex-wrap sm:flex-nowrap items-center gap-x-1 leading-snug">
        {player.onClick ? (
          <button
            onClick={player.onClick}
            className="font-medium text-white-400 hover:underline text-left whitespace-normal sm:whitespace-nowrap"
          >
            {player.name}
            {player.stat && (
              <span className="ml-1 text-xs text-theme-primary opacity-70">
                {player.stat.replace(/\s/g, '\u00A0')}
              </span>
            )}
          </button>
        ) : (
          <span className="font-medium text-left whitespace-normal sm:whitespace-nowrap">
            {player.name}
            {player.stat && (
              <span className="ml-1 text-xs text-gray-400">
                {player.stat.replace(/\s/g, '\u00A0')}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );





  return (
    <div className="flex justify-center items-start gap-x-10 w-full max-w-md mx-auto px-2">
      {/* Balls / Strikes / Outs */}
      <div className="space-y-2 text-right w-[100px] shrink-0">
        <div>
          <div className="text-sm font-semibold mb-1">Balls</div>
          <div className="flex justify-end space-x-1">{renderCircles(balls, 3)}</div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1">Strikes</div>
          <div className="flex justify-end space-x-1">{renderCircles(strikes, 2)}</div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1">Outs</div>
          <div className="flex justify-end space-x-1">{renderCircles(outs, 2)}</div>
        </div>
      </div>

      {/* Diamond */}
      <div className="flex justify-center w-[150px]">
        <div className="relative w-24 h-24 mx-auto">
          <div
            className={baseStyles(bases.second)}
            style={{
              left: 'calc(50% - 20px)',
              top: 'calc(20% + 20px)',
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          />
          <div
            className={baseStyles(bases.first)}
            style={{
              left: 'calc(90% - 20px)',
              top: 'calc(60% + 20px)',
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          />
          <div
            className={baseStyles(bases.third)}
            style={{
              left: 'calc(10% - 20px)',
              top: 'calc(60% + 20px)',
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          />
        </div>
      </div>

      {/* Player info */}
      <div className="text-sm space-y-4 text-left w-[100px] shrink-0 whitespace-nowrap">
        <PlayerDisplay label="Pitching" player={pitcher} />
        <PlayerDisplay label="Batting" player={batter} />
        <PlayerDisplay label="On Deck" player={onDeck} />
      </div>
    </div>
  )
}
