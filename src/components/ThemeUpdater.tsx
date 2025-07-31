// Updates the theme every time a page with this component is loaded (used in layout.tsx to always update theme)
'use client';
import { useEffect, useRef } from 'react';
import { useSettings } from '@/components/Settings';
import { ThemeColors } from '@/types/ThemeColors';
import { useAccount } from '@/hooks/Account';

export const ThemeUpdater = () => {
    const { settings, ready, updateSetting } = useSettings();
    const { user, loading } = useAccount();
    const hasSynced = useRef<boolean>(false);
    const hasMergedFromServer = useRef<boolean>(false);

    useEffect(() => {
        if (loading) return;
        if (!user) return;
        if (hasMergedFromServer.current) return;

        if (user.settings && Object.keys(user.settings).length > 0) 
            Object.entries(user.settings).forEach(([k, v]) => updateSetting(k, v));

        hasMergedFromServer.current = true;
    }, [loading, user]);

    useEffect(() => {
        if (!ready || !settings.theme) return;
        const root = document.documentElement;
        const theme: ThemeColors = settings.theme;

        for (const key in theme) {
            root.style.setProperty(`--theme-${key}`, theme[key]);
        }
    }, [settings.theme, ready]);

    useEffect(() => {
        if (!user || !ready) return;
        if (hasSynced.current) return;
        if (!hasMergedFromServer.current) return;

        async function syncSettings() {
            const res = await fetch('/nextapi/db/update-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings }),
            });
            if (res.ok) hasSynced.current = true;
        }
        syncSettings();
    }, [settings.gamePage, settings.homePage, settings.teamPage, settings.theme, user, ready])

    return null;
};
