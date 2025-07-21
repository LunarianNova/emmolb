// It's bad I know
import { useRef, useEffect, useState } from "react";

export function ClampedName({x, y, text, emoji, color,}: {x: number; y: number; text: string; emoji: string; color: string;}) {
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
    }, [text]);

    const height = 20;
    const textYOffset = 0;

    return (
        <>
            <text x={x + 20} y={y + 12} fontSize={20} dominantBaseline="middle" textAnchor="middle">
                {emoji}
            </text>

            <foreignObject x={x + 40} y={y + textYOffset} width={155} height={height}>
                <div ref={textRef} style={{
                    width: "100%",
                    height: "100%",
                    fontSize: 12,
                    fontFamily: "geist, sans-serif",
                    color: color,
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
                    {text}
                </div>
            </foreignObject>
        </>
    );
}
