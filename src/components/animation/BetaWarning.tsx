import { useRef, useState } from "react";

export default function BetaWarning() {
    const [showPopup, setShowPopup] = useState<boolean>(true);

    if (showPopup) return (
        <g>
            <rect x={100} y={150} height={300} width={600} rx={20} ry={20} fill='#163F5E' />
            <text x={323} y={210} fill={'white'} font-weight='bold' font-size={36}>Warning!</text>
            <text x={120} y={250} fill='white' font-size={12}>This viewer is very much in active beta! If you encounter any bugs, please report them</text>
            <text x={120} y={270} fill='white' font-size={12} >in the <a href='https://discord.com/invite/cr3tRG2xqq' className="underline">Official MMOLB Discord</a> in <a href='https://discord.com/channels/1136709081319604324/1366515448375541953' className="underline">our channel.</a></text>
            <text x={120} y={290} fill='white' font-size={12}>Thank you for being awesome!</text>
            <text x={120} y={310} fill='white' font-size={8}>(Yes you will see this every refresh)</text>
            <text x={120} y={320} fill='white' font-size={8}>(Yes this element is horribly designed)</text>
            <rect x={337} y={380} fill='#151a5e' height={40} width={120} rx={8} ry={8} onClick={() => setShowPopup(false)} cursor='pointer'></rect>
            <text x={365} y={407} fill='white' font-size={24} font-weight='bold' onClick={() => setShowPopup(false)} style={{userSelect: 'none'}} cursor='pointer'>Okay!</text>
        </g>   
    );
    else return null;
}