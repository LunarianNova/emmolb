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
            <div className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                <div className="text-lg font-bold pt-2 text-center">Season Stats</div>
                <div className="text-lg mb-2 text-center">{player.Emoji} {player.FirstName} {player.LastName}</div>
                {((category && category == 'batting') || !category) ? (<div className="mb-4">
                    <div className="text-base font-semibold mb-1 text-center">Batting</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">AVG</div>
                            <div className="text-sm font-normal text-theme-secondary">{batting_average != 'NaN' ? batting_average : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Batting Average</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">OBP</div>
                            <div className="text-sm font-normal text-theme-secondary">{obp != 'NaN' ? obp : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">On-Base Percentage</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">SLG</div>
                            <div className="text-sm font-normal text-theme-secondary">{slg != 'NaN' ? slg : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Slugging Percentage</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">OPS</div>
                            <div className="text-sm font-normal text-theme-secondary">{ops != 'NaN' ? ops : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">On-Base Plus Slugging</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">H</div>
                            <div className="text-sm font-normal text-theme-secondary">{hits}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Hits</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">1B</div>
                            <div className="text-sm font-normal text-theme-secondary">{singles}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Singles</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">2B</div>
                            <div className="text-sm font-normal text-theme-secondary">{doubles}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Doubles</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">3B</div>
                            <div className="text-sm font-normal text-theme-secondary">{triples}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Triples</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">HR</div>
                            <div className="text-sm font-normal text-theme-secondary">{home_runs}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Home Runs</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">BB</div>
                            <div className="text-sm font-normal text-theme-secondary">{walked}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Walks</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">PA</div>
                            <div className="text-sm font-normal text-theme-secondary">{pa}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Plate Appearances</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">AB</div>
                            <div className="text-sm font-normal text-theme-secondary">{at_bats}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">At Bats</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">SB</div>
                            <div className="text-sm font-normal text-theme-secondary">{sb}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Stolen Bases</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">CS</div>
                            <div className="text-sm font-normal text-theme-secondary">{cs}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Caught Stealing</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">GIDP</div>
                            <div className="text-sm font-normal text-theme-secondary">{gidp}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Grounded Into Double Plays</div>
                        </div>
                    </div>
                </div>) : ('')}
                {((category && category == 'pitching') || !category) ? (<div className="mb-4">
                    <div className="text-base font-semibold mb-1 text-center">Pitching</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">ERA</div>
                            <div className="text-sm font-normal text-theme-secondary">{era != 'NaN' ? era : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Earned Run Average</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">WHIP</div>
                            <div className="text-sm font-normal text-theme-secondary">{whip != 'NaN' ? whip : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Walks and Hits Per Inning</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">K/BB</div>
                            <div className="text-sm font-normal text-theme-secondary">{kbb != 'NaN' ? kbb : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Strikeout to Walk Ratio</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">K/9</div>
                            <div className="text-sm font-normal text-theme-secondary">{k9 != 'NaN' ? k9 : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Strikeouts Per 9 Innings</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">H/9</div>
                            <div className="text-sm font-normal text-theme-secondary">{h9 != 'NaN' ? h9 : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Hits Per 9 Innings</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">BB/9</div>
                            <div className="text-sm font-normal text-theme-secondary">{bb9 != 'NaN' ? bb9 : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Walks Per 9 Innings</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">HR/9</div>
                            <div className="text-sm font-normal text-theme-secondary">{hr9 != 'NaN' ? hr9 : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Homers Per 9 Innings</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">IP</div>
                            <div className="text-sm font-normal text-theme-secondary">{ip != '0.000' ? ip : '-'}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Innings Played</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">K</div>
                            <div className="text-sm font-normal text-theme-secondary">{strikeouts}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Strikeouts</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">BBP</div>
                            <div className="text-sm font-normal text-theme-secondary">{walks}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Walks Allowed (Pitching)</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">HA</div>
                            <div className="text-sm font-normal text-theme-secondary">{hits_allowed}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Hits Allowed (Pitching)</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">HB</div>
                            <div className="text-sm font-normal text-theme-secondary">{hit_batters}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Hit Batters</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">ER</div>
                            <div className="text-sm font-normal text-theme-secondary">{earned_runs}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Earned Runs</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">W</div>
                            <div className="text-sm font-normal text-theme-secondary">{wins}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Wins</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">L</div>
                            <div className="text-sm font-normal text-theme-secondary">{losses}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Losses</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">QS</div>
                            <div className="text-sm font-normal text-theme-secondary">{quality_starts}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Quality Starts</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">SV</div>
                            <div className="text-sm font-normal text-theme-secondary">{saves}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Saves</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">BS</div>
                            <div className="text-sm font-normal text-theme-secondary">{blown_saves}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Blown Saves</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">G</div>
                            <div className="text-sm font-normal text-theme-secondary">{appearances}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Games Pitched</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">GF</div>
                            <div className="text-sm font-normal text-theme-secondary">{finished_games}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Games Finished</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">CG</div>
                            <div className="text-sm font-normal text-theme-secondary">{complete_games}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Complete Games</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">SHO</div>
                            <div className="text-sm font-normal text-theme-secondary">{shutouts}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Shutouts</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">NH</div>
                            <div className="text-sm font-normal text-theme-secondary">{no_hitters}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">No Hitters</div>
                        </div>
                    </div>
                </div>) : ''}
                {((category && category == 'defense') || !category) ? (<div className="mb-6">
                    <div className="text-base font-semibold mb-1 text-center">Defense</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">E</div>
                            <div className="text-sm font-normal text-theme-secondary">{errors}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Errors</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">A</div>
                            <div className="text-sm font-normal text-theme-secondary">{assists}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Assists</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">PO</div>
                            <div className="text-sm font-normal text-theme-secondary">{putouts}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Putouts</div>
                        </div>
                        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center">
                            <div className="text-xs font-bold cursor-pointer text-theme-text">DP</div>
                            <div className="text-sm font-normal text-theme-secondary">{double_plays}</div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-theme-primary text-theme-text text-xs rounded opacity-0 group-hover:opacity-100 transition text-center whitespace-pre z-50">Double Plays</div>
                        </div>
                    </div>
                </div>) : ''}
            </div>
        </div>
    );
}