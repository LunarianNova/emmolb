'use client'
import { useState } from "react";

type SeasonTrophyProps = {
    season: number;
};

export default function SeasonTrophy({ season }: SeasonTrophyProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center gap-1 relative">
            <div className="relative">
                <button onClick={() => setIsOpen(!isOpen)} className="text-5xl focus:outline-none">🏆</button>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-black flex items-center justify-center select-none">
                    {season}
                </div>
            </div>

            {isOpen && (
                <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
                    <div className="font-semibold">First Place in Season {season}</div>
                </div>
            )}
        </div>
    )
}