'use client'

import { Bases } from '@/types/Bases'
import { Event } from '@/types/Event'
import { TeamPlayer } from '@/types/Team'
import React from 'react'

type PlayerInfo = {
  player: TeamPlayer | string;
  onClick?: () => void;
}

type GameStateDisplayProps = {
<<<<<<< HEAD
  balls: number
  strikes: number
  outs: number
  bases: {
    first: boolean | string | null
    second: boolean | string | null
    third: boolean | string | null
  }
  pitcher: PlayerInfo
  batter: PlayerInfo
  onDeck: PlayerInfo
=======
    event: Event;
    bases: Bases;
    pitcher: PlayerInfo;
    batter: PlayerInfo;
    onDeck: PlayerInfo;
>>>>>>> dcab695 (Proper Typing (sort of))
}

export function GameStateDisplay({
  event,
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
      active ? 'opacity-90 bg-theme-text' : 'opacity-15 bg-theme-text'
    }`

  function PlayerDisplay({ label, player }: { label: string; player: PlayerInfo }){ 
    const isTeamPlayer = (p: any): p is TeamPlayer => p && typeof p === 'object' && 'first_name' in p && 'last_name' in p;
    const p = player.player;
    const name = isTeamPlayer(p) ? `${p.first_name} ${p.last_name}` : typeof(p) === 'string' ? p : '';
    const stat = isTeamPlayer(p) && p.stats ? p.position_type === 'Batter' ? `(${p.stats.ops.toFixed(3)} OPS)` : `(${p.stats.era.toFixed(3)} ERA)` : '';
    return (
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
            {name}
              <span className="ml-1 text-xs text-theme-primary opacity-70">
                {stat}
              </span>
          </button>
        ) : (
          <span className="font-medium text-left whitespace-normal sm:whitespace-nowrap">
            {name}
            <span className="ml-1 text-xs text-theme-primary opacity-70">
                {stat}
              </span>
          </span>
        )}
      </div>
    </div>
  );
    }





  return (
    <>
    <div className="flex justify-center items-start gap-x-10 w-full max-w-md mx-auto px-2">
      {/* Balls / Strikes / Outs */}
      <div className="space-y-2 text-right w-[100px] shrink-0">
        <div>
          <div className="text-sm font-semibold mb-1">Balls</div>
          <div className="flex justify-end space-x-1">{renderCircles(event.balls, 3)}</div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1">Strikes</div>
          <div className="flex justify-end space-x-1">{renderCircles(event.strikes, 2)}</div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1">Outs</div>
          <div className="flex justify-end space-x-1">{renderCircles(event.outs, 2)}</div>
        </div>
      </div>

      {/* Diamond */}
      <div className="flex justify-center w-[150px]">
        <div className="relative w-24 h-24 mx-auto">
          <div>
          <div
<<<<<<< HEAD
            className={baseStyles(bases.second ? true : false)}
=======
            className={baseStyles(!!bases.second)}
>>>>>>> dcab695 (Proper Typing (sort of))
            style={{
              left: 'calc(50% - 20px)',
              top: 'calc(20% + 20px)',
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          />
          </div>
          <div>
          <div
<<<<<<< HEAD
            className={baseStyles(bases.first ? true : false)}
=======
            className={baseStyles(!!bases.first)}
>>>>>>> dcab695 (Proper Typing (sort of))
            style={{
              left: 'calc(90% - 20px)',
              top: 'calc(60% + 20px)',
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          />
          
          </div>
          <div>
          <div
<<<<<<< HEAD
            className={baseStyles(bases.third ? true : false)}
=======
            className={baseStyles(!!bases.third)}
>>>>>>> dcab695 (Proper Typing (sort of))
            style={{
              left: 'calc(10% - 20px)',
              top: 'calc(60% + 20px)',
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          ></div>
<<<<<<< HEAD
=======
          </div>
>>>>>>> dcab695 (Proper Typing (sort of))
        </div>
      </div>

      {/* Player info */}
      <div className="text-sm space-y-4 text-left w-[100px] shrink-0 whitespace-nowrap">
        <PlayerDisplay label="Pitching" player={pitcher} />
        <PlayerDisplay label="Batting" player={batter} />
        <PlayerDisplay label="On Deck" player={onDeck} />
      </div>
    </div>
<<<<<<< HEAD
    <div className='text-theme-text text-sm'>1st: {bases.first ? bases.first : '-'}<br></br>2nd: {bases.second ? bases.second : '-'}<br></br>3rd: {bases.third ? bases.third : '-'}</div>
=======
    1st: {bases.first}<br></br>
    2nd: {bases.second}<br></br>
    3rd: {bases.third}<br></br>
>>>>>>> dcab695 (Proper Typing (sort of))
    </>
  )
}
