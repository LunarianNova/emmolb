import { Team } from "@/types/Team";
import { ClampedName } from "./ClampedName";

export default function GameInfo({homeTeam, awayTeam, stadium,}: {homeTeam: Team; awayTeam: Team; stadium: string;}) {
    return (
        <g>
            <text fontSize={12} fill='white' fontWeight='bold' fontFamily='geist, sans-serif' x="760" y="57">Vs.</text>
            <text fontSize={12} fill='white' fontWeight='bold' fontFamily='geist, sans-serif' x="760" y="124">@</text>
            <rect x="790" y="10" width="200" height="40" fill={`#${awayTeam.color}`} fillOpacity="0.7" rx="7" ry="7" />
            <rect x="790" y="60" width="200" height="40" fill={`#${homeTeam.color}`} fillOpacity="0.7" rx="7" ry="7" />
            <rect x="790" y="110" width="200" height="20" fill="#163F5E" fillOpacity="0.7" rx="7" ry="7" />
            <ClampedName x={790} y={20} team={awayTeam} />
            <ClampedName x={790} y={70} team={homeTeam} />        
            <text fontSize={12} fill='white' fontWeight='' fontFamily='geist, sans-serif' x="890" y="124" textAnchor='middle'>{stadium}</text>
        </g>
    );
}