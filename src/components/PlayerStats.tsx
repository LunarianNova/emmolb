export default function PlayerStats({ player, category }: {player: any, category?: any}) {
    console.log(category);
    const stats = player.Stats ?? player;
    const singles = stats.singles ?? 0;
    const doubles = stats.doubles ?? 0;
    const triples = stats.triples ?? 0;
    const home_runs = stats.home_runs ?? 0;
    const walked = stats.walked ?? 0;
    const hbp = stats.hit_by_pitch ?? 0;
    const sac_flies = stats.sacrifice_flies ?? 0;
    const at_bats = stats.at_bats ?? 0;
    const pa = stats.plate_appearances ?? 0;
    const sb = stats.stolen_bases ?? 0;
    const cs = stats.caught_stealing ?? 0;
    const gidp = stats.grounded_into_double_play ?? 0;
    const outs = stats.outs ?? 0;
    const walks = stats.walks ?? 0;
    const strikeouts = stats.strikeouts ?? 0;
    const wins = stats.wins ?? 0;
    const losses = stats.losses ?? 0;
    const quality_starts = stats.quality_starts ?? 0;
    const hit_batters = stats.hit_batters ?? 0;
    const shutouts = stats.shutouts ?? 0;
    const no_hitters = stats.no_hitters ?? 0;
    const hits_allowed = stats.hits_allowed ?? 0;
    const earned_runs = stats.earned_runs ?? 0;
    const hra = stats.home_runs_allowed ?? 0;
    const saves = stats.saves ?? 0;
    const blown_saves = stats.blown_saves ?? 0;
    const complete_games = stats.complete_games ?? 0;
    const finished_games = stats.finished_games ?? 0;
    const putouts = stats.putouts ?? 0;
    const errors = stats.errors ?? 0;
    const assists = stats.assists ?? 0;
    const double_plays = stats.double_plays ?? 0;
    const appearances = stats.appearances ?? 0;

    const hits = singles + doubles + triples + home_runs;
    const batting_average = (hits/at_bats).toFixed(3);
    const obp = ((hits + walked + hbp) / (at_bats + walked + hbp + sac_flies)).toFixed(3);
    const slg = ((singles + 2 * doubles + 3 * triples + 4 * home_runs)/(at_bats)).toFixed(3);
    const ops = (Number(obp) + Number(slg)).toFixed(3);
    const ip = (Math.floor(outs / 3) + (outs % 3) / 10).toFixed(1);
    const era = ((earned_runs / (outs / 3)) * 9).toFixed(3);
    const whip = ((walks + hits_allowed) / (outs/3)).toFixed(3);
    const kbb = (strikeouts/walks).toFixed(3);
    const k9 = ((strikeouts / (outs/3)) * 9).toFixed(3);
    const h9 = ((hits_allowed / (outs/3)) * 9).toFixed(3);
    const bb9 = ((walks / (outs/3)) * 9).toFixed(3);
    const hr9 = ((hra / (outs/3)) * 9).toFixed(3);




    return (
        <div>
            <div className="bg-[#1c2a3a] py-2 px-4 rounded-xl mt-1 h-full">
                <div className="text-lg font-bold pt-2 text-center">Season Stats</div>
                <div className="text-lg mb-2 text-center">{player.Emoji} {player.FirstName} {player.LastName}</div>
                {((category && category == 'batting') || !category) ? (<div className="mb-4">
                    <div className="text-base font-semibold mb-1 text-center">Batting</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">AVG</div>
                            <div className="text-sm font-normal">{batting_average != 'NaN' ? batting_average : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Batting Average</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">OBP</div>
                            <div className="text-sm font-normal">{obp != 'NaN' ? obp : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">On-Base Percentage</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">SLG</div>
                            <div className="text-sm font-normal">{slg != 'NaN' ? slg : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Slugging Percentage</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">OPS</div>
                            <div className="text-sm font-normal">{ops != 'NaN' ? ops : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">On-Base Plus Slugging</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">H</div>
                            <div className="text-sm font-normal">{hits}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Hits</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">1B</div>
                            <div className="text-sm font-normal">{singles}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Singles</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">2B</div>
                            <div className="text-sm font-normal">{doubles}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Doubles</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">3B</div>
                            <div className="text-sm font-normal">{triples}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Triples</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">HR</div>
                            <div className="text-sm font-normal">{home_runs}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Home Runs</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">BB</div>
                            <div className="text-sm font-normal">{walked}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Walks</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">PA</div>
                            <div className="text-sm font-normal">{pa}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Plate Appearances</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">AB</div>
                            <div className="text-sm font-normal">{at_bats}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">At Bats</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">SB</div>
                            <div className="text-sm font-normal">{sb}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Stolen Bases</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">CS</div>
                            <div className="text-sm font-normal">{cs}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Caught Stealing</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">GIDP</div>
                            <div className="text-sm font-normal">{gidp}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Grounded Into Double Plays</div>
                        </div>
                    </div>
                </div>) : ('')}
                {((category && category == 'pitching') || !category) ? (<div className="mb-4">
                    <div className="text-base font-semibold mb-1 text-center">Pitching</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">ERA</div>
                            <div className="text-sm font-normal">{era != 'NaN' ? era : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Earned Run Average</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">WHIP</div>
                            <div className="text-sm font-normal">{whip != 'NaN' ? whip : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Walks and Hits Per Inning</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">K/BB</div>
                            <div className="text-sm font-normal">{kbb != 'NaN' ? kbb : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Strikeout to Walk Ratio</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">K/9</div>
                            <div className="text-sm font-normal">{k9 != 'NaN' ? k9 : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Strikeouts Per 9 Innings</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">H/9</div>
                            <div className="text-sm font-normal">{h9 != 'NaN' ? h9 : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Hits Per 9 Innings</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">BB/9</div>
                            <div className="text-sm font-normal">{bb9 != 'NaN' ? bb9 : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Walks Per 9 Innings</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">HR/9</div>
                            <div className="text-sm font-normal">{hr9 != 'NaN' ? hr9 : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Homers Per 9 Innings</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">IP</div>
                            <div className="text-sm font-normal">{ip != '0.000' ? ip : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Innings Played</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">K</div>
                            <div className="text-sm font-normal">{strikeouts}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Strikeouts</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">BBP</div>
                            <div className="text-sm font-normal">{walks}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Walks Allowed (Pitching)</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">HA</div>
                            <div className="text-sm font-normal">{hits_allowed}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Hits Allowed (Pitching)</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">HB</div>
                            <div className="text-sm font-normal">{hit_batters}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Hit Batters</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">ER</div>
                            <div className="text-sm font-normal">{earned_runs}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Earned Runs</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">W</div>
                            <div className="text-sm font-normal">{wins}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Wins</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">L</div>
                            <div className="text-sm font-normal">{losses}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Losses</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">QS</div>
                            <div className="text-sm font-normal">{quality_starts}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Quality Starts</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">SV</div>
                            <div className="text-sm font-normal">{saves}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Saves</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">BS</div>
                            <div className="text-sm font-normal">{blown_saves}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Blown Saves</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">G</div>
                            <div className="text-sm font-normal">{appearances}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Games Pitched</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">GF</div>
                            <div className="text-sm font-normal">{finished_games}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Games Finished</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">CG</div>
                            <div className="text-sm font-normal">{complete_games}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Complete Games</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">SHO</div>
                            <div className="text-sm font-normal">{shutouts}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Shutouts</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">NH</div>
                            <div className="text-sm font-normal">{no_hitters}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">No Hitters</div>
                        </div>
                    </div>
                </div>) : ''}
                {((category && category == 'defense') || !category) ? (<div className="mb-6">
                    <div className="text-base font-semibold mb-1 text-center">Defense</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">E</div>
                            <div className="text-sm font-normal">{errors}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Errors</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">A</div>
                            <div className="text-sm font-normal">{assists}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Assists</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">PO</div>
                            <div className="text-sm font-normal">{putouts}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Putouts</div>
                        </div>
                        <div className="relative group bg-[#161d29] border border-[#2a3a4a] rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-white">DP</div>
                            <div className="text-sm font-normal">{double_plays}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Double Plays</div>
                        </div>
                    </div>
                </div>) : ''}
            </div>
        </div>
    );
}