import { useState } from "react";

type StatTooltipProps = {
    label: string;
    value: number | string;
    tooltip: string;
    isActive: boolean;
    onToggle: () => void;
}

function StatTooltip({ label, value, tooltip, isActive, onToggle }: StatTooltipProps) {
    return (
        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center" onClick={(e) => {e.stopPropagation(); onToggle();}}>
            <div className="text-xs font-bold cursor-pointer text-theme-text">{label}</div>
            <div className="text-sm font-normal text-theme-secondary">{value}</div>
            <div className={`absolute bottom-full mb-2 px-2 py-1 text-xs rounded z-50 text-center whitespace-pre transition-opacity bg-theme-primary text-theme-text group-hover:opacity-100 group-hover:pointer-events-auto ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>{tooltip}</div>
        </div>
    );
}

export default function PlayerStats({ player, category }: {player: any, category?: any}) {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const toggle = (label: string) => {setActiveTooltip((prev) => (prev === label ? null : label)), console.log(label);};

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
        <div onClick={() => setActiveTooltip(null)}>
            <div className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                <div className="text-lg font-bold pt-2 text-center">Season Stats</div>
                <div className="text-lg mb-2 text-center">{player.Emoji} {player.FirstName} {player.LastName}</div>
                {((category && category == 'batting') || !category) ? (<div className="mb-4">
                    <div className="text-base font-semibold mb-1 text-center">Batting</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <StatTooltip label='BA' value={batting_average != 'NaN' ? batting_average : '-'} tooltip="Batting Average" isActive={activeTooltip === 'BA'} onToggle={() => toggle('BA')} />
                        <StatTooltip label='OBP' value={obp != 'NaN' ? obp : '-'} tooltip="On-Base Percentage" isActive={activeTooltip === 'OBP'} onToggle={() => toggle('OBP')} />
                        <StatTooltip label='SLG' value={slg != 'NaN' ? slg : '-'} tooltip="Slugging Percentage" isActive={activeTooltip === 'SLG'} onToggle={() => toggle('SLG')} />
                        <StatTooltip label='OPS' value={ops != 'NaN' ? ops : '-'} tooltip="On-Base Plus Slugging" isActive={activeTooltip === 'OPS'} onToggle={() => toggle('OPS')} />
                        <StatTooltip label='H' value={hits} tooltip="Hits" isActive={activeTooltip === 'H'} onToggle={() => toggle('H')} />
                        <StatTooltip label='1B' value={singles} tooltip="Singles" isActive={activeTooltip === '1B'} onToggle={() => toggle('1B')} />
                        <StatTooltip label='2B' value={doubles} tooltip="Doubles" isActive={activeTooltip === '2B'} onToggle={() => toggle('2B')} />
                        <StatTooltip label='3B' value={triples} tooltip="Triples" isActive={activeTooltip === '3B'} onToggle={() => toggle('3B')} />
                        <StatTooltip label='HR' value={home_runs} tooltip="Home Runs" isActive={activeTooltip === 'HR'} onToggle={() => toggle('HR')} />
                        <StatTooltip label='BB' value={walked} tooltip="Walks" isActive={activeTooltip === 'BB'} onToggle={() => toggle('BB')} />
                        <StatTooltip label='PA' value={pa} tooltip="Plate Appearances" isActive={activeTooltip === 'PA'} onToggle={() => toggle('PA')} />
                        <StatTooltip label='AB' value={pa} tooltip="At Bats" isActive={activeTooltip === 'AB'} onToggle={() => toggle('AB')} />
                        <StatTooltip label='SB' value={sb} tooltip="Stolen Bases" isActive={activeTooltip === 'SB'} onToggle={() => toggle('SB')} />
                        <StatTooltip label='CS' value={cs} tooltip="Caught Stealing" isActive={activeTooltip === 'CS'} onToggle={() => toggle('CS')} />
                        <StatTooltip label='GIDP' value={gidp} tooltip="Grounded Into Double Plays" isActive={activeTooltip === 'GIDP'} onToggle={() => toggle('GIDP')} />
                    </div>
                </div>) : ('')}
                {((category && category == 'pitching') || !category) ? (<div className="mb-4">
                    <div className="text-base font-semibold mb-1 text-center">Pitching</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <StatTooltip label='ERA' value={era != 'NaN' ? era : '-'} tooltip="Earned Run Average" isActive={activeTooltip === 'ERA'} onToggle={() => toggle('ERA')} />
                        <StatTooltip label='WHIP' value={whip != 'NaN' ? whip : '-'} tooltip="Walks and Hits Per Inning" isActive={activeTooltip === 'WHIP'} onToggle={() => toggle('WHIP')} />
                        <StatTooltip label='K/BB' value={kbb != 'NaN' ? kbb : '-'} tooltip="Strikout to Walk Ratio" isActive={activeTooltip === 'KBB'} onToggle={() => toggle('KBB')} />
                        <StatTooltip label='K/9' value={k9 != 'NaN' ? k9 : '-'} tooltip="Strikeouts Per 9 Innings" isActive={activeTooltip === 'K9'} onToggle={() => toggle('K9')} />
                        <StatTooltip label='H/9' value={h9 != 'NaN' ? h9 : '-'} tooltip="Hits Per 9 Innings" isActive={activeTooltip === 'H9'} onToggle={() => toggle('H9')} />
                        <StatTooltip label='BB/9' value={bb9 != 'NaN' ? bb9 : '-'} tooltip="Walks Per 9 Innings" isActive={activeTooltip === 'BB9'} onToggle={() => toggle('BB9')} />
                        <StatTooltip label='HR/9' value={hr9 != 'NaN' ? hr9 : '-'} tooltip="Home Runs Per 9 Innings" isActive={activeTooltip === 'HR9'} onToggle={() => toggle('HR9')} />
                        <StatTooltip label='IP' value={ip != '0.000' ? ip : '-'} tooltip="Innings Played" isActive={activeTooltip === 'IP'} onToggle={() => toggle('IP')} />
                        <StatTooltip label='K' value={strikeouts} tooltip="Strikeouts" isActive={activeTooltip === 'K'} onToggle={() => toggle('K')} />
                        <StatTooltip label='BBP' value={walks} tooltip="Walks Allowed (Pitching)" isActive={activeTooltip === 'BBP'} onToggle={() => toggle('BBP')} />
                        <StatTooltip label='HA' value={hits_allowed} tooltip="Hits Allowed (Pitching)" isActive={activeTooltip === 'HA'} onToggle={() => toggle('HA')} />
                        <StatTooltip label='HB' value={hit_batters} tooltip="Hits Batters" isActive={activeTooltip === 'HB'} onToggle={() => toggle('HB')} />
                        <StatTooltip label='ER' value={earned_runs} tooltip="Earned Runs" isActive={activeTooltip === 'ER'} onToggle={() => toggle('ER')} />
                        <StatTooltip label='W' value={wins} tooltip="Earned Runs" isActive={activeTooltip === 'W'} onToggle={() => toggle('W')} />
                        <StatTooltip label='L' value={losses} tooltip="Losses" isActive={activeTooltip === 'L'} onToggle={() => toggle('L')} />
                        <StatTooltip label='QS' value={quality_starts} tooltip="Quality Starts" isActive={activeTooltip === 'QS'} onToggle={() => toggle('QS')} />
                        <StatTooltip label='SV' value={saves} tooltip="Saves" isActive={activeTooltip === 'SV'} onToggle={() => toggle('SV')} />
                        <StatTooltip label='BS' value={blown_saves} tooltip="Blown Saves" isActive={activeTooltip === 'BS'} onToggle={() => toggle('BS')} />
                        <StatTooltip label='G' value={appearances} tooltip="Games Pitched" isActive={activeTooltip === 'G'} onToggle={() => toggle('G')} />
                        <StatTooltip label='GF' value={finished_games} tooltip="Games Finished" isActive={activeTooltip === 'GF'} onToggle={() => toggle('GF')} />
                        <StatTooltip label='CG' value={complete_games} tooltip="Complete Games" isActive={activeTooltip === 'CG'} onToggle={() => toggle('CG')} />
                        <StatTooltip label='SHO' value={shutouts} tooltip="Shutouts" isActive={activeTooltip === 'SHO'} onToggle={() => toggle('SHO')} />
                        <StatTooltip label='NH' value={no_hitters} tooltip="No Hitters" isActive={activeTooltip === 'NH'} onToggle={() => toggle('NH')} />
                    </div>
                </div>) : ''}
                {((category && category == 'defense') || !category) ? (<div className="mb-6">
                    <div className="text-base font-semibold mb-1 text-center">Defense</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <StatTooltip label='E' value={errors} tooltip="Errors" isActive={activeTooltip === 'E'} onToggle={() => toggle('E')} />
                        <StatTooltip label='A' value={assists} tooltip="Assists" isActive={activeTooltip === 'A'} onToggle={() => toggle('A')} />
                        <StatTooltip label='PO' value={putouts} tooltip="Putouts" isActive={activeTooltip === 'PO'} onToggle={() => toggle('PO')} />
                        <StatTooltip label='DP' value={double_plays} tooltip="Double Plays" isActive={activeTooltip === 'DP'} onToggle={() => toggle('DP')} />
                    </div>
                </div>) : ''}
            </div>
        </div>
    );
}