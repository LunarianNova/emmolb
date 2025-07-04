export default function PitchZone({zone} : {zone: number}) {
    return (
        <svg viewBox="-1 -1 66 66" className="ml-1 w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <rect width="13" height="13" x="13" y="13" fill={zone === 1 ? "#f00" : "none"} stroke="var(--theme-text)" strokeWidth="1"></rect>
            <rect width="13" height="13" x="26" y="13" fill={zone === 2 ? "#f00" : "none"} stroke="var(--theme-text)" strokeWidth="1"></rect>
            <rect width="13" height="13" x="39" y="13" fill={zone === 3 ? "#f00" : "none"} stroke="var(--theme-text)" strokeWidth="1"></rect>
            <rect width="13" height="13" x="13" y="26" fill={zone === 4 ? "#f00" : "none"} stroke="var(--theme-text)" strokeWidth="1"></rect>
            <rect width="13" height="13" x="26" y="26" fill={zone === 5 ? "#f00" : "none"} stroke="var(--theme-text)" strokeWidth="1"></rect>
            <rect width="13" height="13" x="39" y="26" fill={zone === 6 ? "#f00" : "none"} stroke="var(--theme-text)" strokeWidth="1"></rect>
            <rect width="13" height="13" x="13" y="39" fill={zone === 7 ? "#f00" : "none"} stroke="var(--theme-text)" strokeWidth="1"></rect>
            <rect width="13" height="13" x="26" y="39" fill={zone === 8 ? "#f00" : "none"} stroke="var(--theme-text)" strokeWidth="1"></rect>
            <rect width="13" height="13" x="39" y="39" fill={zone === 9 ? "#f00" : "none"} stroke="var(--theme-text)" strokeWidth="1"></rect>
            <path d="M 0,32 H 13 v -19.5 h 19.5 V 0 H 13 0 Z" fill={zone === 11 ? "#f00" : "none"} stroke="#ccc" strokeWidth="1"></path>
            <path d="m 32,0 v 13 h 19.5 V 32 H 65 V 13 0 Z" fill={zone === 12 ? "#f00" : "none"} stroke="#ccc" strokeWidth="1"></path>
            <path d="M 32,65 V 52 H 13 V 32 H 0 v 19.5 13 z" fill={zone === 13 ? "#f00" : "none"} stroke="#ccc" strokeWidth="1"></path>
            <path d="M 65,32 H 52 v 19.5 h -19.5 v 13 h 19.5 13 z" fill={zone === 14 ? "#f00" : "none"} stroke="#ccc" strokeWidth="1"></path>
        </svg>
    )
}