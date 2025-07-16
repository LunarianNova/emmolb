// components/LastUpdatedCounter.tsx
// Author: Navy
import { useEffect, useState } from 'react';

interface LastUpdatedCounterProps {
    lastUpdatedTimestamp: number; // Date.now()
}

export default function LastUpdatedCounter({ lastUpdatedTimestamp }: LastUpdatedCounterProps) {
    const [secondsAgo, setSecondsAgo] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsAgo(Math.floor((Date.now() - lastUpdatedTimestamp) / 1000));
        }, 1000);

        setSecondsAgo(0);

        return () => clearInterval(interval);
    }, [lastUpdatedTimestamp]);

    return <div className='text-xs text-theme-text opacity-70'>{secondsAgo} second{secondsAgo !== 1 ? 's' : ''} old</div>;
}
