import { useEffect, useState } from 'react';

interface LastUpdatedCounterProps {
  lastUpdatedTimestamp: number; // pass Date.now() or timestamp of last event update
}

export default function LastUpdatedCounter({ lastUpdatedTimestamp }: LastUpdatedCounterProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    // Update secondsAgo every second
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdatedTimestamp) / 1000));
    }, 1000);

    // Reset immediately when lastUpdatedTimestamp changes
    setSecondsAgo(0);

    return () => clearInterval(interval);
  }, [lastUpdatedTimestamp]);

  return <div className='text-xs text-gray-400'>{secondsAgo} second{secondsAgo !== 1 ? 's' : ''} old</div>;
}
