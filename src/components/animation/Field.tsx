export default function Field() {
    return (
        <g>
            {/* Fill Background */}
            <rect x="-200" y="0" width="1200" height="600" fill='#5D8857' />

            {/* Center Square */}
            <path style={{fill: "#C8B35D", stroke: "#C8B35D", strokeWidth: 1}} d="M 205,752 A 95,95 0 0 1 395,752" transform="matrix(2,0,0,2,-200,-1145)"/>
            <rect style={{fill: "#5D8857", stroke: "#C8B35D", strokeWidth: 20}} width={168} height={168} x={-65} y={292} transform="matrix(1.01,-1.01,1.01,1.01,0,0)" />

            {/* Base Circles */}
            <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={260} cy={355} r={40}/>
            <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={540} cy={355} r={40}/>
            <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={400} cy={230} r={40}/>
            <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={400} cy={355} r={30}/>

            {/* Foul Lines */}
            <line x1='400' y1='550' x2='0' y2='150' stroke="white" strokeWidth="4" />
            <line x1='400' y1='550' x2='800' y2='150' stroke="white" strokeWidth="4" />

            {/* Home Base Circle */}
            <circle style={{fill: "#C8B35D", stroke: "#C8B35D"}} cx={400} cy={520} r={50}/>

            {/* Pitcher's Mound Line */}
            <rect style={{fill: "#FFFFFF"}} width={25} height={7} x={387.5} y={352.5} />

            {/* Bases */}
            <rect x="415" y="50" width="37" height="37" fill="white" transform="rotate(45 0 0)" />  { /* Third */ }
            <rect x="420" y="-145" width="37" height="37" fill="white" transform="rotate(45 0 0)" /> { /* Second */ }
            <rect x="615" y="-150" width="37" height="37" fill="white" transform="rotate(45 0 0)" /> { /* First */ }
            <rect x="381.5" y="500" width="37" height="25" fill="white"/> { /* Home */ }
            <polygon points="381.5,524.5 418.5,524.5 400,545" fill="white" />

            {/* Batter Squares */}
            <rect x="360" y="505" width="15" height="30" fill="none" strokeWidth="3" stroke="white"/>
            <rect x="424.5" y="505" width="15" height="30" fill="none" strokeWidth="3" stroke="white"/>

            {/* Bleachers */}
            <polygon points="480,500 980,500 980,170 830,170" fill="#ABABAB" />        
            <polygon points="320,500 -180,500 -180,170 -30,170" fill="#ABABAB" />  
        </g>
    );
};