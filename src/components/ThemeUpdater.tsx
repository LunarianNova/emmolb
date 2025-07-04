// Updates the theme every time a page with this component is loaded
'use client';
import { useEffect } from 'react';
import { useSettings } from '@/components/Settings';
import { ThemeColors } from '@/types/ThemeColors';

export const ThemeUpdater = () => {
    const { settings, ready } = useSettings();

    useEffect(() => {
        if (!ready || !settings.theme) return;
        const root = document.documentElement;
        const theme: ThemeColors = settings.theme;

        for (const key in theme) {
        root.style.setProperty(`--theme-${key}`, theme[key]);
        }
    }, [settings.theme, ready]);

    return <></>;
};
