// It's bad I know
import { getContrastTextColor } from "@/helpers/Colors";
import { Team } from "@/types/Team";
import { useRef, useEffect, useState } from "react";

export function ClampedName({x, y, team,}: {x: number; y: number; team: Team;}) {
    const name = `${team.location} ${team.name}` 

    const textRef = useRef<HTMLDivElement>(null);
    const [isOneLine, setIsOneLine] = useState(false);

    useEffect(() => {
        const handle = requestAnimationFrame(() => {
            if (textRef.current) {
                const lines = Math.round(textRef.current.scrollHeight / 14); // 10px line-height
                setIsOneLine(lines === 1);
            }
        });
        return () => cancelAnimationFrame(handle);
    }, [name]);

    const height = 20;
    const textYOffset = 0;

    return (
        <g>
            <text x={x + 20} y={y + 12} fontSize={20} dominantBaseline="middle" textAnchor="middle">
                {team.emoji}
            </text>

            <foreignObject x={x + 40} y={y + textYOffset} width={155} height={height}>
                <div ref={textRef} style={{
                    width: "100%",
                    height: "100%",
                    fontSize: 12,
                    fontFamily: "geist, sans-serif",
                    color: getContrastTextColor(team.color),
                    lineHeight: "10px",
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: 'bold',
                    ...(isOneLine ? {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        WebkitLineClamp: "unset",
                        WebkitBoxOrient: "unset",}
                    : { display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",}),}}>
                    {name}
                </div>
            </foreignObject>
        </g>
    );
}
