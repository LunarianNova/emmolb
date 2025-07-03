'use client'

import Loading from "@/components/Loading";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GameStateDisplayCompact, LiveGameCompact } from "./LiveGameCompact";
import PlayerStats from "./PlayerStats";
import CheckboxDropdown from "./CheckboxDropdown";

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

export default function TeamPage({ id }: { id: string }) {
  const LeagueNames: Record<string, string> = {
    '6805db0cac48194de3cd3fe7': 'Baseball',
    '6805db0cac48194de3cd3fe8': 'Precision',
    '6805db0cac48194de3cd3fe9': 'Isosceles',
    '6805db0cac48194de3cd3fea': 'Liberty',
    '6805db0cac48194de3cd3feb': 'Maple',
    '6805db0cac48194de3cd3fec': 'Cricket',
    '6805db0cac48194de3cd3fed': 'Tornado',
    '6805db0cac48194de3cd3fee': 'Coleoptera',
    '6805db0cac48194de3cd3fef': 'Clean',
    '6805db0cac48194de3cd3ff0': 'Shiny',
    '6805db0cac48194de3cd3ff1': 'Psychic',
    '6805db0cac48194de3cd3ff2': 'Unidentified',
    '6805db0cac48194de3cd3ff3': 'Ghastly',
    '6805db0cac48194de3cd3ff4': 'Amphibian',
    '6805db0cac48194de3cd3ff5': 'Deep',
  };

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [game, setGame] = useState<any>(null);
  const [gameID, setGameID] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [expandedPlayers, setExpandedPlayers] = useState<Record<string, boolean>>({});
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(["2"]);
  const [feedFilters, setFeedFilters] = useState<string[]>(["game", "augment"]);
  const [dropdownOpen, setDropdownOpen] = useState<{ season: boolean; type: boolean }>({season: false, type: false});

  useEffect(() => {
    async function APICalls() {
      try {
        const currentGame = await fetch(`/nextapi/game-by-team/${id}`);
        if (currentGame.ok) {
            const res = await currentGame.json();
            const gameId = res.game_id;
            setGameID(gameId);
            const currentHeader = await fetch(`/nextapi/gameheader/${gameId}`)
            if (currentHeader.ok) setGame(await currentHeader.json());
        }

        const stored = JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]');
        setFavorites(new Set(stored));

        const teamRes = await fetch(`/nextapi/team/${id}`);
        if (!teamRes.ok) throw new Error('Failed to load team data');
        setTeam(await teamRes.json());
        setExpandedPlayers(Object.fromEntries(team.Players.map((player: any) => [player.PlayerID, false])))
        const uniqueTypes: string[] = Array.from(new Set(team.Feed.map((event: any) => event.type)));
        setFeedFilters(uniqueTypes);


      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    APICalls();
  }, [id]);

  function toggleFavorite(teamId: string) {
    setFavorites(prev => {
        const updated = new Set(prev);
        updated.has(teamId) ? updated.delete(teamId) : updated.add(teamId);

        localStorage.setItem('favoriteTeamIDs', JSON.stringify([...updated]));
        return updated;
    });
  }

  if (loading) return (
    <>
      <Loading />
    </>
  );

  if (!team) return (
    <>
      <div className="text-white text-center mt-10">Can't find that team</div>
    </>
  );

  const uniqueTypes: string[] = Array.from(new Set(team.Feed.map((event: any) => event.type)));

  return (
    <>
      <main className="mt-16">
        <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
            <div className="relative w-full h-28 px-6 py-4 border-2 rounded-2xl shadow-xl border-theme-accent overflow-hidden mb-4 flex items-center" style={{background: `#${team.Color}`, color: getContrastTextColor(team.Color)}}>
                <button onClick={(e) => {e.stopPropagation(); toggleFavorite(team._id);}} className="absolute top-2 left-2 text-2xl z-10 hover:scale-110 transition-transform">
                    {favorites.has(team._id) ? '★' : '☆'}
                </button>
                <span className="text-7xl flex-shrink-0">
                    {team.Emoji}
                </span>
                <div className="absolute inset-0 flex flex-col items-center justify-start mt-3 pointer-events-none px-2">
                    <Link href={`/league/${team.League}`}>
                        <span className="text-xl font-bold underline cursor-pointer pointer-events-auto hover:opacity-80 transition text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                            {LeagueNames[team.League]}
                        </span>
                    </Link>
                    <span className="text-2xl font-bold tracking-wide leading-tight">{team.Location} {team.Name}</span>
                </div>
                <span className="absolute bottom-1 right-2 text-base font-semibold opacity-80 pointer-events-none">
                    {team.Record["Regular Season"].Wins} - {team.Record["Regular Season"].Losses}
                </span>
                <span className="absolute top-1 right-2 text-base font-semibold opacity-80 pointer-events-none">{team.Record["Regular Season"].RunDifferential > 0 ? '+' : ''}{team.Record["Regular Season"].RunDifferential}</span>
            </div>
            {game && game.game.State != "Complete" && (<><Link href={`/game/${gameID}`}><LiveGameCompact homeTeam={game.homeTeam} awayTeam={game.awayTeam} game={game.game} gameId={gameID} killLinks={true} /></Link></>)}
            <div className="mb-4 flex justify-center gap-4">
                <button className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                    Season Schedule
                </button>
            </div>
            <h2 className="text-xl font-bold mb-4 text-center">Roster</h2>
            <div className="mb-4 text-center">
                <label className="mr-2 font-semibold">Sort by:</label>
                <select className="bg-theme-primary text-theme-text px-2 py-1 rounded">
                    <option value="">Default</option>
                    <optgroup label="Batting">
                        <option value="AVG">AVG</option>
                        <option value="OBP">OBP</option>
                        <option value="SLG">SLG</option>
                        <option value="OPS">OPS</option>
                        <option value="Hits">Hits</option>
                        <option value="Singles">Singles</option>
                        <option value="Doubles">Doubles</option>
                        <option value="Triples">Triples</option>
                        <option value="Home Runs">Home Runs</option>
                        <option value="Total Bases">Total Bases</option>
                        <option value="Walked">Walked</option>
                        <option value="Hit By Pitch">Hit By Pitch</option>
                        <option value="Struck Out">Struck Out</option>
                        <option value="Plate Appearances">Plate Appearances</option>
                        <option value="At Bats">At Bats</option>
                        <option value="Stolen Bases">Stolen Bases</option>
                        <option value="Caught Stealing">Caught Stealing</option>
                        <option value="Grounded Into Double Plays">Grounded Into Double Plays</option>
                    </optgroup>
                    <optgroup label="Pitching">
                        <option value="ERA">ERA</option>
                        <option value="WHIP">WHIP</option>
                        <option value="K/BB">K/BB</option>
                        <option value="K/9">K/9</option>
                        <option value="H/9">H/9</option>
                        <option value="BB/9">BB/9</option>
                        <option value="HR/9">HR/9</option>
                        <option value="Innings Pitched">Innings Pitched</option>
                        <option value="Strikeouts">Strikeouts</option>
                        <option value="Walks">Walks</option>
                        <option value="Hits Allowed">Hits Allowed</option>
                        <option value="Hit Batters">Hit Batters</option>
                        <option value="Earned Runs">Earned Runs</option>
                        <option value="Wins">Wins</option>
                        <option value="Losses">Losses</option>
                        <option value="Quality Starts">Quality Starts</option>
                        <option value="Saves">Saves</option>
                        <option value="Blown Saves">Blown Saves</option>
                        <option value="Appearances">Appearances</option>
                        <option value="Games Finished">Games Finished</option>
                        <option value="Complete Games">Complete Games</option>
                        <option value="Shutouts">Shutouts</option>
                        <option value="No Hitters">No Hitters</option>
                    </optgroup>
                    <optgroup label="Defense">
                        <option value="Errors">Errors</option>
                        <option value="Assists">Assists</option>
                        <option value="Putouts">Putouts</option>
                        <option value="Double Plays">Double Plays</option>
                        <option value="Runners Caught Stealing">Runners Caught Stealing</option>
                        <option value="RCS%">RCS%</option>
                    </optgroup>
                </select>
            </div>
            <div className="flex justify-center">
                <div className="w-128 space-y-2">
                    {team.Players.map((player: any, i: number) => {
                        return (
                            <div key={i}>
                                <div className="flex justify-between items-center p-1 rounded link-hover cursor-pointer transition"
                                onClick={()=>{setExpandedPlayers(prev => ({...prev, [player.PlayerID]: !prev[player.PlayerID],}))}}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="w-4 text-xl text-center">{player.Emoji}</span>
                                        <span className="w-8 text-sm text-right">#{player.Number}</span>
                                        <span className="w-6 text-sm font-bold text-theme-text opacity-80 text-right">{player.Position}</span>
                                        <span className="flex-1 font-semibold text-left overflow-hidden text-ellipsis whitespace-nowrap">{player.FirstName} {player.LastName}</span>
                                    </div>
                                </div>
                                {expandedPlayers[player.PlayerID] && (
                                    <PlayerStats player={player} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold">Recent Events</span>
                    <div className="flex gap-3 mb-2">
                    <CheckboxDropdown
                        label="Seasons"
                        options={["1", "2"]}
                        selected={selectedSeasons}
                        setSelected={setSelectedSeasons}
                        isOpen={dropdownOpen.season}
                        toggleOpen={() =>
                        setDropdownOpen((prev) => ({ ...prev, season: !prev.season }))
                        }
                    />
                    <CheckboxDropdown
                        label="Types"
                        options={uniqueTypes}
                        selected={feedFilters}
                        setSelected={setFeedFilters}
                        isOpen={dropdownOpen.type}
                        toggleOpen={() =>
                        setDropdownOpen((prev) => ({ ...prev, type: !prev.type }))
                        }
                    />
                    </div>
                </div>
                <div className="bg-theme-primary rounded-xl p-3 max-h-60 overflow-y-auto text-sm space-y-1">
                    {team.Feed.filter((event: any) => 
                        selectedSeasons.includes(event.season?.toString()) && feedFilters.includes(event.type)).slice().reverse().map((event: any, i: number) => {
                        const parts = event.text.split(/( vs\. | - )/); // split and keep separators
                        console.log(event.links);
                        
                        return (
                            <div key={i}>
                                {event.emoji} Season {event.season}, {event.status}, Day {event.day}:{' '}
                                {event.type === 'game' ? (() => {
                                    let linkIndex = 0;
                                    return parts.map((part: string, index: number) => {
                                        if (/^\s*vs\.\s*$|^\s*-\s*$/.test(part)) {return <span key={`sep-${index}`}>{part}</span>;}

                                        const link = event.links?.[linkIndex];
                                        linkIndex++;

                                        if (!link) {
                                        return <span key={`text-${index}`}>{part}</span>;
                                        }

                                        const href = link.type === 'game' ? `/watch/${link.id}` : `/${link.type}/${link.id}`;

                                        return (
                                        <Link key={`link-${index}`} href={href}>
                                            <span className="underline cursor-pointer">{part}</span>
                                        </Link>
                                        );
                                    });
                                })() : event.text}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </main>
    </>
  );
}
