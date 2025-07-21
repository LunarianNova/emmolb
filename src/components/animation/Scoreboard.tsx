import { Vector2 } from "@/types/Vector2";

export function Scoreboard({position, titles, values,}: {position: Vector2; titles: [string, string, string]; values: [string, string, string];}) {
    return (
        <g>
            {/* Main Body */}
            <rect x={position.x} y={position.y} width="100" height="100" fill="#163F5E" />
            <rect x={position.x+10} y={position.y+20} width="15" height="100" fill="#163F5E" />
            <rect x={position.x+75} y={position.y+20} width="15" height="100" fill="#163F5E" />

            {/* Value Backgrounds */}
            <rect x={position.x+60} y={position.y+10} width="30" height="20" fill="#081926" />
            <rect x={position.x+60} y={position.y+40} width="30" height="20" fill="#081926" />
            <rect x={position.x+60} y={position.y+70} width="30" height="20" fill="#081926" />

            {/* Titles */}
            <text fontWeight='bold' fontFamily='geist, sans-serif' fill='white' x={position.x+50} y={position.y+25} textAnchor='end'>{titles[0]}</text>
            <text fontWeight='bold' fontFamily='geist, sans-serif' fill='white' x={position.x+50} y={position.y+55} textAnchor="end">{titles[1]}</text>
            <text fontWeight='bold' fontFamily='geist, sans-serif' fill='white' x={position.x+50} y={position.y+85} textAnchor='end'>{titles[2]}</text>

            {/* Values */}
            <foreignObject x={position.x+47} y={position.y+4} width={40} height={30}>
                <div style={{ fontFamily: 'geist-mono, monospace', fontWeight: 'bold', color: 'white', fontSize: '16px', textAlign: 'right', lineHeight: '30px' }}>
                    {values[0]}
                </div>
            </foreignObject>
            <foreignObject x={position.x+47} y={position.y+34} width={40} height={30}>
                <div style={{ fontFamily: 'geist-mono, monospace', fontWeight: 'bold', color: 'white', fontSize: '16px', textAlign: 'right', lineHeight: '30px' }}>
                    {values[1]}
                </div>
            </foreignObject>
            <foreignObject x={position.x+47} y={position.y+64} width={40} height={30}>
                <div style={{ fontFamily: 'geist-mono, monospace', fontWeight: 'bold', color: 'white', fontSize: '16px', textAlign: 'right', lineHeight: '30px' }}>
                    {values[2]}
                </div>
            </foreignObject>
        </g>
    );
}