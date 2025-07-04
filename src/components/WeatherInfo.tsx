import { Weather } from '@/types/Weather'
import React, { useState } from 'react'

export function WeatherInfo({ weather }: { weather: Weather }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center gap-1 relative">
            <button onClick={() => setIsOpen(!isOpen)} className="text-xl focus:outline-none">{weather.emoji}</button>

            {isOpen && (
                <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
                    <div className="font-semibold">{weather.name}</div>
                    <div className="text-gray-300">{weather.tooltip}</div>
                </div>
            )}
        </div>
    )
}
