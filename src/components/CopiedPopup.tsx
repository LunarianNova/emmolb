// components/CopiedPopup.tsx
// Author: Navy
import React, { useEffect, useState } from 'react';

export function CopiedPopup() {
    const [visible, setVisible] = useState(false);

    const show = () => {
        setVisible(true);
        setTimeout(() => setVisible(false), 1500);
    };

    useEffect(() => {
        (window as any).showCopiedPopup = show;
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 inline-block rounded-full px-3 py-1 text-base font-bold text-theme-secondary bg-theme-primary border border-theme-accent shadow-md select-none">
            Copied!
        </div>
    );
}
