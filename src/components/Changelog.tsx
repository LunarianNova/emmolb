// components/Changelog.tsx
// Author: Navy
import { useEffect, useState } from "react";

type ChangelogEntry = {
    title: string;
    date: string;
    body: string;
};

export default function Changelog() {
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);

    useEffect(() => {
        // maybe this will eventually be API?
        setEntries([
            {
                title: "It's been a while",
                date: "July 16th, 2025",
                body: `Hello! We went to GDQ and had a wonderful time. Season three was a lot of work to accomodate for, but we tried our best.\n  - Season Schedule\n  - MMOLB Links\n  - So many new options\n  - Batting/Throwing Handedness\n  - Lotd of bug fixes\n  - It's been a week. There're prolly more, but I forgot them\nThe home page was taking forever to load on dev env, if that's the case in production, I might need to do some fixes`
            },
            {
                title: "Up past my bedtime",
                date: "July 3rd, 2025",
                body: `I said I was going to bed. Instead I made:\n  - Schedule Page\n  - #1 CUTOFF LINE\n  - Changelog\n  - Reordering Favorite Teams\nGood night now. - Navy`
            },
            {
                title: "Is this thing on?",
                date: "July 3rd, 2025",
                body: `This is a location where we can communicate to users why the site broke for 10 seconds (it was an update being pushed)`
            }
        ]);
    }, []);

    return (
        <div className="bg-theme-primary rounded-xl p-3 max-h-60 overflow-y-auto text-sm space-y-4">
            <div className="text-xl font-bold text-center text-theme-primary">Changelog</div>
            {entries.map((entry, idx) => (
                <div key={idx}>
                    <div className="font-bold text-lg">{entry.title}</div>
                    <div className="text-xs opacity-70 mb-2">{entry.date}</div>
                    <pre className="font-normal text-theme-secondary whitespace-pre-wrap pl-2">{entry.body}</pre>
                </div>
            ))}
        </div>
    );
}
