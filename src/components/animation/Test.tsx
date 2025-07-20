'use client';
import { useEffect, useRef } from 'react';
import { Player } from './PlayerClass';

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

    const angle1 = 45 * (Math.PI / 180);  // 45 degrees in radians
    const angle2 = 135 * (Math.PI / 180); // 135 degrees in radians

    const x1 = homeX + length * Math.cos(angle1);
    const y1 = homeY - length * Math.sin(angle1);

    const x2 = homeX + length * Math.cos(angle2);
    const y2 = homeY - length * Math.sin(angle2);

    return (
    <svg ref={svgRef} width="100%" height="100vh" viewBox="150 0 500 600" style={{ background: '#5D8857' }}>
        <path
            d="M300,400 
               Q400,200 500,400 
               Q400,550 300,400"
            fill="#f0e68c"
            stroke="black"
            strokeWidth="2"
        />
        {/* Foul lines */}
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
        <polygon points="381.5,525 418.5,525 400,545" fill="white" />

    </svg>
);


}
