'use client';

import React, { useEffect, useState } from 'react';

const messages = [
  'Did you know? Now you know!',
  'Lost in the stars...',
  "We aren't good at coming up with these",
  'Join the official MMOLB Discord!',
  'This app was not approved for use by anyone',
  "Any bugs are actually the end user's fault",
  'Fun fact: {error in line 4: "facts" not found}!',
  'May contain nuts',
  "The E stands for 'Echo'",
  "The E stands for 'Enhanced'",
  "The E stands for 'Egyptian'",
  "The E stands for 'Ecological'"
];


export default function Loading() {
  const [index, setIndex] = useState<number>(Math.floor(Math.random() * messages.length))

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(Math.floor(Math.random() * messages.length))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const message = index !== null ? messages[index] : 'Loading...'

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-theme-text select-none">
      <div className="animate-spin text-4xl">⚾</div>
      <div className="mt-4 text-sm opacity-70">{message}</div>
    </div>
  )
}
