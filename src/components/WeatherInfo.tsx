import React, { useState } from 'react'

interface WeatherInfoProps {
  emoji: string
  title: string
  description: string
}

export function WeatherInfo({ emoji, title, description }: WeatherInfoProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center gap-1 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xl focus:outline-none"
        aria-expanded={isOpen}
        aria-label={`Toggle info for ${title}`}
      >
        {emoji}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
          <div className="font-semibold">{title}</div>
          <div className="text-gray-300">{description}</div>
        </div>
      )}
    </div>
  )
}
