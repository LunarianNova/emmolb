// TODO: Comment this. The general layout is just about done.
// TODO: Crowds and dugouts
'use client';
import { useEffect, useRef } from 'react';
import { Player } from './PlayerClass';
import { ClampedName } from './ClampedName';
import { getContrastTextColor } from '@/helpers/Colors';

export default function Playground() {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!svgRef.current || hasInitialized.current) return;
        hasInitialized.current = true;
        if (svgRef.current) {
            const batter = new Player({name: "Batter", teamColor: "#fedb2f", position: "Batter", bats: "R", throws: "R", startX: 432, startY: 500, number: 3});
            svgRef.current.appendChild(batter.group);
            batter.turnAround("back");
            const firstBaseman = new Player({name: "1B", teamColor: "#a36bad", position: "FirstBaseman", bats: "R", throws: "R", startX: 560, startY: 280, number: 3});
            const secondBaseman = new Player({name: "2B", teamColor: "#a36bad", position: "SecondBaseman", bats: "R", throws: "R", startX: 300, startY: 220, number: 3});
            const shortstop = new Player({name: "SS", teamColor: "#a36bad", position: "Shortstop", bats: "R", throws: "R", startX: 500, startY: 220, number: 3});
            const thirdBaseman = new Player({name: "3B", teamColor: "#a36bad", position: "ThirdBaseman", bats: "R", throws: "R", startX: 235, startY: 280, number: 3});
            const leftFielder = new Player({name: "LF", teamColor: "#a36bad", position: "LeftFielder", bats: "R", throws: "R", startX: 160, startY: 160, number: 3});
            const centerFielder = new Player({name: "CF", teamColor: "#a36bad", position: "CenterFielder", bats: "R", throws: "R", startX: 400, startY: 80, number: 3});
            const rightFielder = new Player({name: "RF", teamColor: "#a36bad", position: "RightFielder", bats: "R", throws: "R", startX: 640, startY: 160, number: 3});
            const pitcher = new Player({name: "Pitcher", teamColor: "#a36bad", position: "Pitcher", bats: "R", throws: "R", startX: 400, startY: 325, number: 3});
            svgRef.current.appendChild(firstBaseman.group);
            svgRef.current.appendChild(secondBaseman.group);
            svgRef.current.appendChild(shortstop.group);
            svgRef.current.appendChild(thirdBaseman.group);
            svgRef.current.appendChild(leftFielder.group);            
            svgRef.current.appendChild(centerFielder.group);
            svgRef.current.appendChild(rightFielder.group);
            svgRef.current.appendChild(pitcher.group);
            const firstRunner = new Player({name: "First!", teamColor: "#fedb2f", position: "FirstRunner", bats: "R", throws: "R", startX: 541.5, startY: 325, number: 3});
            const secondRunner = new Player({name: "Second!", teamColor: "#fedb2f", position: "SecondRunner", bats: "R", throws: "R", startX: 400, startY: 190, number: 3});
            const thirdRunner = new Player({name: "Third!", teamColor: "#fedb2f", position: "ThirdRunner", bats: "R", throws: "R", startX: 256.5, startY: 325, number: 3});
            svgRef.current.appendChild(firstRunner.group);
            svgRef.current.appendChild(secondRunner.group);
            svgRef.current.appendChild(thirdRunner.group);
        }
    }, []);

    const homeX = 400;
    const homeY = 550;
    const length = 550;

    const angle1 = 45 * (Math.PI / 180);
    const angle2 = 135 * (Math.PI / 180);

    const x1 = homeX + length * Math.cos(angle1);
    const y1 = homeY - length * Math.sin(angle1);

    const x2 = homeX + length * Math.cos(angle2);
    const y2 = homeY - length * Math.sin(angle2);

    return (
    <svg ref={svgRef} width="100%" height="100vh" viewBox="-200 0 1200 600" style={{ background: '#242424' }}>
        {/* Foul lines */}
        <rect x="-200" y="0" width="1200" height="600" fill='#5D8857' />
        <path style={{fill: "#C8B35D", stroke: "#C8B35D", strokeWidth: 1}} d="M 205,752 A 95,95 0 0 1 395,752" transform="matrix(2,0,0,2,-200,-1145)"/>
        <rect style={{fill: "#5D8857", stroke: "#C8B35D", strokeWidth: 20}} width={168} height={168} x={-65} y={292} transform="matrix(1.01,-1.01,1.01,1.01,0,0)" />
        <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={260} cy={355} r={40}/>
        <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={540} cy={355} r={40}/>
        <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={400} cy={230} r={40}/>
        <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={400} cy={355} r={30}/>
        <line x1={homeX} y1={homeY} x2={x1} y2={y1} stroke="white" strokeWidth="4" />
        <line x1={homeX} y1={homeY} x2={x2} y2={y2} stroke="white" strokeWidth="4" />
        <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={400} cy={520} r={50}/>
        <rect style={{fill: "#FFFFFF"}} width={25} height={7} x={387.5} y={352.5} />
        <rect x="415" y="50" width="37" height="37" fill="white" transform="rotate(45 0 0)" />
        <rect x="420" y="-145" width="37" height="37" fill="white" transform="rotate(45 0 0)" />
        <rect x="615" y="-150" width="37" height="37" fill="white" transform="rotate(45 0 0)" />
        <rect x="381.5" y="500" width="37" height="25" fill="white"/>
        <rect x="360" y="505" width="15" height="30" fill="none" strokeWidth="3" stroke="white"/>
        <rect x="424.5" y="505" width="15" height="30" fill="none" strokeWidth="3" stroke="white"/>
        <polygon points="381.5,524.5 418.5,524.5 400,545" fill="white" />
        <polygon points="480,500 980,500 980,170 830,170" fill="#ABABAB" />        
        <polygon points="320,500 -180,500 -180,170 -30,170" fill="#ABABAB" />        
        <rect x="-180" y="20" width="100" height="100" fill="#163F5E" />
        <rect x="-170" y="40" width="15" height="100" fill="#163F5E" />
        <rect x="-105" y="40" width="15" height="100" fill="#163F5E" />
        <rect x="-120" y="30" width="30" height="20" fill="#081926" />
        <rect x="-120" y="60" width="30" height="20" fill="#081926" />
        <rect x="-120" y="90" width="30" height="20" fill="#081926" />
        <rect x="-60" y="20" width="100" height="100" fill="#163F5E" />
        <rect x="-50" y="40" width="15" height="100" fill="#163F5E" />
        <rect x="15" y="40" width="15" height="100" fill="#163F5E" />
        <rect x="0" y="30" width="30" height="20" fill="#081926" />
        <rect x="0" y="60" width="30" height="20" fill="#081926" />
        <rect x="0" y="90" width="30" height="20" fill="#081926" />
        <rect x="-160" y="490" width="50" height="20" fill="#35393A" />
        <rect x="-160" y="510" width="70" height="10" fill="#000000" />
        <rect x="-160" y="520" width="57" height="50" fill="#FFFFFF" rx="5" ry="5"/>
        <rect x="-160" y="520" width="57" height="60" fill="#FFFFFF" rx="15" ry="15"/>
        <rect x="-155" y="580" width="47" height="20" fill="#35393A" rx="5" ry="5"/>
        <rect x="-149" y="535" width="11" height="25" fill="black" rx="7" ry="7"/>
        <rect x="-125" y="535" width="11" height="25" fill="black" rx="7" ry="7"/>
        <rect x="-60" y="510" width="360" height="80" fill="#163F5E" fillOpacity="0.7" />
        <polygon points="-60,590 -60,570, -80,580" fill="#163F5E" fillOpacity="0.7"/>
        <text fontSize={12} fill='white' fontWeight='bold' fontFamily='geist, sans-serif' x="760" y="57">Vs.</text>
        <text fontSize={12} fill='white' fontWeight='bold' fontFamily='geist, sans-serif' x="760" y="124">@</text>
        <rect x="790" y="10" width="200" height="40" fill="#a36bad" fillOpacity="0.7" rx="7" ry="7" />
        <rect x="790" y="60" width="200" height="40" fill="#fedb2f" fillOpacity="0.7" rx="7" ry="7" />
        <rect x="790" y="110" width="200" height="20" fill="#163F5E" fillOpacity="0.7" rx="7" ry="7" />
        <ClampedName x={790} y={20} emoji="⛵" text="The Naughty Nautical Knots" color={getContrastTextColor('#a36bad')} />
        <ClampedName x={790} y={70} emoji="🟡" text="The Mellow Yellows" color="black"/>        
        <text fontSize={12} fill='white' fontWeight='' fontFamily='geist, sans-serif' x="890" y="124" textAnchor='middle'>The Healthy Helpers Stadium</text>
        <foreignObject x="-50" y="520" width="340" height="60">
            <div style={{ fontSize: 12, fontFamily: "geist, sans-serif", fontWeight: "bold", color: "white" }} dangerouslySetInnerHTML={{__html: "Today's game is looking like a good one. If only my programmers could actually make this live! But they won't stop redesigning me!"}} />
        </foreignObject>
        <text fontWeight='bold' fontFamily='geist, sans-serif' fill='white' x='-10' y='45' textAnchor='end'>BALL</text>
        <text fontWeight='bold' fontFamily='geist, sans-serif' fill='white' x='-10' y='75' textAnchor="end">STRK</text>
        <text fontWeight='bold' fontFamily='geist, sans-serif' fill='white' x='-10' y='105' textAnchor="end">OUT</text>
        <foreignObject x={-13} y={24} width={40} height={30}>
        <div style={{ fontFamily: 'geist-mono, monospace', fontWeight: 'bold', color: 'white', fontSize: '16px', textAlign: 'right', lineHeight: '30px' }}>
            0
        </div>
        </foreignObject>
        <foreignObject x={-13} y={54} width={40} height={30}>
        <div style={{ fontFamily: 'geist-mono, monospace', fontWeight: 'bold', color: 'white', fontSize: '16px', textAlign: 'right', lineHeight: '30px' }}>
            0
        </div>
        </foreignObject>
        <foreignObject x={-13} y={84} width={40} height={30}>
        <div style={{ fontFamily: 'geist-mono, monospace', fontWeight: 'bold', color: 'white', fontSize: '16px', textAlign: 'right', lineHeight: '30px' }}>
            0
        </div>
        </foreignObject>
        <text fontWeight='bold' fontFamily='geist, sans-serif' fill='white' x='-130' y='45' textAnchor='end'>NNK</text>
        <text fontWeight='bold' fontFamily='geist, sans-serif' fill='white' x='-130' y='75' textAnchor="end">MY</text>
        <text fontWeight='bold' fontFamily='geist, sans-serif' fill='white' x='-130' y='105' textAnchor='end'>INNG</text>
        <foreignObject x={-133} y={24} width={40} height={30}>
        <div style={{ fontFamily: 'geist-mono, monospace', fontWeight: 'bold', color: 'white', fontSize: '16px', textAlign: 'right', lineHeight: '30px' }}>
            0
        </div>
        </foreignObject>
        <foreignObject x={-133} y={54} width={40} height={30}>
        <div style={{ fontFamily: 'geist-mono, monospace', fontWeight: 'bold', color: 'white', fontSize: '16px', textAlign: 'right', lineHeight: '30px' }}>
            0
        </div>
        </foreignObject>
        <foreignObject x={-133} y={84} width={40} height={30}>
        <div style={{ fontFamily: 'geist-mono, monospace', fontWeight: 'bold', color: 'white', fontSize: '16px', textAlign: 'right', lineHeight: '30px' }}>
            ▲1
        </div>
        </foreignObject>

        <text x='-10' y='400'>plese imageine crowsd</text>
        <text x='600' y='400'>adn croud here! :)</text>
    </svg>
);


}
