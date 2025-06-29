'use client'
import { Navbar } from "@/components/Navbar";
import { useSettings } from "@/components/Settings";

export default function OptionsPage() {
  const { settings, updateSetting } = useSettings();

  return (
    <>
    <Navbar />
    <main className="mt-12">
        <div className="min-h-screen bg-[#0c111b] text-white font-sans p-4 pt-20 max-w-3xl mx-auto">
            <div className="text-2xl font-bold text-center mb-6">Options</div>
            <label className="flex items-center space-x-3 cursor-pointer select-none">
                <span className="text-sm font-medium text-gray-200">Use Blasesloaded UI</span>
                <div className="relative">
                    <input
                    type="checkbox"
                    checked={settings.useBlasesloaded}
                    onChange={(e) => updateSetting('useBlasesloaded', e.target.checked)}
                    className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#121a28] rounded-full peer peer-checked:bg-blue-500 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </div>
            </label>

        </div>
    </main>
    </>
  );
};
