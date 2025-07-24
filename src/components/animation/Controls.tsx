export default function AnimationControls({onPause, onRewind, onForward, onJTL, isPaused, displayJTL}: {onPause: () => void; onRewind: () => void; onForward: () => void; onJTL: () => void; isPaused: boolean; displayJTL: boolean;}) {
    return (
        <g transform="translate(850, 530)">
            <rect x={0} y={-10} width={130} height={60} rx={8} fill="#163F5E" />

            <g transform="translate(10, 0)" onClick={onRewind} cursor="pointer">
                <rect x={0} y={0} width={30} height={40} fill="transparent" />
                <polygon points="15,10 15,30 0,20" fill="white" />
                <polygon points="30,10 30,30 15,20" fill="white" />
            </g>

            <g transform="translate(50, 0)" onClick={onPause} cursor="pointer">
                <rect x={0} y={0} width={30} height={40} fill="transparent" />
                {isPaused ? (<polygon points="5,10 5,30 25,20" fill="white" />) 
                : (
                    <>
                        <rect x={5} y={10} width={6} height={20} fill="white" />
                        <rect x={17} y={10} width={6} height={20} fill="white" />
                    </>
                )}
            </g>

            <g transform="translate(90, 0)" onClick={onForward} cursor="pointer">
                <rect x={0} y={0} width={30} height={40} fill="transparent" />
                <polygon points="0,10 0,30 15,20" fill="white" />
                <polygon points="15,10 15,30 30,20" fill="white" />
            </g>

            {displayJTL && (<g transform="translate(0, -40)" onClick={onJTL} cursor="pointer">
                <rect x={0} y={0} width={130} height={25} rx={4} fill="#163F5E" />
                <text x={16} y={17.5} fill={'white'}>Jump to Live</text>
            </g>)}
        </g>
    );
}
