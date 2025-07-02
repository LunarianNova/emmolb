'use client'
import { CopiedPopup } from "@/components/CopiedPopup";
import { EventBlock } from "@/components/EventBlock";
import { Navbar } from "@/components/Navbar";
import { ThemeColors, useSettings } from "@/components/Settings";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OptionsPage() {
    const { settings, updateSetting, resetTheme } = useSettings();
    const [importData, setImportData] = useState("");

    useEffect(() => {
        if (!settings.theme) return;

        for (const [key, value] of Object.entries(settings.theme))
            document.documentElement.style.setProperty(`--theme-${key}`, value);
    }, [JSON.stringify(settings.theme)]); // Re-run on every change

  return (
    <>
    <Navbar />
    <CopiedPopup />
    <main className="mt-12">
        <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto">
            <div className="text-2xl font-bold text-center mb-6">Options</div>
            <label className="flex items-center space-x-3 cursor-pointer select-none">
                <div className="relative">
                    <input
                    type="checkbox"
                    checked={settings.useBlasesloaded}
                    onChange={(e) => updateSetting('useBlasesloaded', e.target.checked)}
                    className="sr-only peer"
                    />
                    <div className="w-11 h-6 rounded-full transition-colors" style={{ backgroundColor: settings.useBlasesloaded ? 'var(--theme-primary)' : 'var(--theme-secondary)'}} />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-medium text-theme-secondary opacity-80">Use Blasesloaded UI</span>
            </label>
            <Link href='https://github.com/RangerRick/blobile' className="text-theme-secondary opacity-70 text-xs text-bottom hover:underline">Credit to Ranger Rick's Blobile GitHub for most the code</Link>
            <div className="mt-6 space-y-4 mb-10">
                <h2 className="text-lg font-semibold mb-0">Customize Theme</h2>
                <p className="text-xs text-color-secondary opacity-70">Enjoy Your Eldritch Horrors...</p>
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                    <div className="relative">
                        <input
                        type="checkbox"
                        checked={settings.useTeamColoredHeaders}
                        onChange={(e) => updateSetting('useTeamColoredHeaders', e.target.checked)}
                        className="sr-only peer"
                        />
                        <div className="w-11 h-6 rounded-full transition-colors" style={{ backgroundColor: settings.useTeamColoredHeaders ? 'var(--theme-primary)' : 'var(--theme-secondary)'}} />
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                    </div>
                    <span className="text-sm font-medium text-theme-secondary opacity-80">Change Event Log Headers to Match Team Colors</span>
                </label>
                {(['primary', 'secondary', 'accent', 'background', 'score', 'text', 'secondaryText'] as (keyof ThemeColors)[]).map((key) => (                    
                    <div key={key} className="flex items-center justify-between">
                        <label className="capitalize text-md text-theme-secondary opacity-80">{key} color</label>
                        <input
                            type="color"
                            value={settings.theme?.[key] || '#ffffff'}
                            onChange={(e) => updateSetting(`theme.${key}`, e.target.value)}
                            className="w-10 h-6 p-0 border-0 bg-transparent"
                        />
                    </div>
                ))}
                <EventBlock emoji='🧩' title='Secondary Text/Color' messages={[{index: 1, message: "Primary Text/Color"}, {index: 0, message: "Accent is used for very slightly noticeable outlines on most things"}]}/>
                <button onClick={resetTheme} className="link-hover px-4 py-2 bg-theme-accent text-sm text-theme-secondary rounded mb-4">
                    Reset Theme
                </button>
            </div>

            <h2 className="text-lg font-semibold mb-0">Import/Export Settings</h2>
            <textarea placeholder="Paste exported settings here" value={importData} onChange={(e) => setImportData(e.target.value)} className="w-full h-32 p-2 bg-theme-background text-theme-text border border-theme-accent rounded"/>
            <div>
                <button
                onClick={() => {
                    try {
                        const parsed = JSON.parse(importData);
                        Object.entries(parsed).forEach(([key, value]) => updateSetting(key, value));
                        alert("Settings imported!");
                    } catch (e) {
                        alert("Invalid settings JSON.");
                    }
                }}className="px-4 py-2 link-hover bg-theme-accent text-theme-secondary rounded mr-4">
                Import Settings
                </button>
                <button onClick={() => {
                    const json = JSON.stringify(settings, null, 2);
                    navigator.clipboard.writeText(json);
                    (window as any).showCopiedPopup?.();
                }} className="px-4 py-2 link-hover bg-theme-accent text-theme-secondary rounded">
                    Export Settings
                </button>
            </div>
        </div>
    </main>
    </>
  );
};
