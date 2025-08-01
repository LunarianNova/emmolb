// Updates the theme every time a page with this component is loaded (used in layout.tsx to always update theme)
'use client';
import { useEffect, useRef } from 'react';
import { useSettings } from '@/components/Settings';
import { ThemeColors } from '@/types/ThemeColors';
import { useAccount } from '@/hooks/Account';

export const ThemeUpdater = () => {
    const { settings, ready, updateSetting } = useSettings();
    const { user, loading } = useAccount();
    const hasMergedFromServer = useRef<boolean>(false);

    const settingsDependency = JSON.stringify(settings);

    useEffect(() => {
        if (loading || !user || hasMergedFromServer.current) return;

        if (user.settings && Object.keys(user.settings).length > 0) 
            Object.entries(user.settings).forEach(([k, v]) => updateSetting(k, v));

        hasMergedFromServer.current = true;
    }, [loading, user, updateSetting]);

    useEffect(() => {
        if (!ready || !settings.theme) return;
        const root = document.documentElement;
        const theme: ThemeColors = settings.theme;

        for (const key in theme) {
            root.style.setProperty(`--theme-${key}`, theme[key]);
        }
    }, [settings.theme, ready]);

    useEffect(() => {
        if (!user || !ready || !hasMergedFromServer.current) return;

        const handler = setTimeout(() => { // Debounce
            async function syncSettings() {
                await fetch('/nextapi/db/account/update-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ settings }),
                });
            }
            syncSettings();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [settingsDependency, user, ready])

    return null;
};
