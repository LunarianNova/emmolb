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
  "The E stands for 'Epic'",
  "The E stands for 'Exceptional'",
  "The E stands for 'Egypt'"
];

export default function Loading() {
  // Initialize with random message index
  const [messageIndex, setMessageIndex] = useState(() => Math.floor(Math.random() * messages.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(Math.floor(Math.random() * messages.length));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-6xl animate-spin mb-4 select-none" aria-label="Loading">
        ⚾
      </div>
      <p className="text-sm text-gray-400 italic text-center max-w-xs transition-opacity duration-500">
        {messages[messageIndex]}
      </p>
    </div>
  );
}
