'use client';
import { useState } from 'react';
import Picker, { EmojiClickData } from 'emoji-picker-react';
import { getContrastTextColor } from '@/helpers/Colors';
import { useRouter } from 'next/navigation';

export default function CreateLeague() {
    const [leagueName, setLeagueName] = useState('');
    const [leagueEmoji, setLeagueEmoji] = useState('⚾');
    const [leagueColor, setLeagueColor] = useState('#FFFFFF');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const router = useRouter();

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setLeagueEmoji(emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        const res = await fetch('/nextapi/db/create-league', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                league_name: leagueName,
                league_emoji: leagueEmoji,
                league_color: leagueColor,
            }),
        });

        if (res.ok) {
            router.push(`/custom-league/${leagueName}`)
        } else {
            setStatus('error');
        }
    };

    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto h-full">
                <form onSubmit={handleSubmit} className="flex flex-col items-center text-center space-y-10 max-w-lg mx-auto">

                    <div className='relative w-full h-28 px-6 py-4 border-2 rounded-2xl shadow-xl overflow-hidden mb-4 flex items-center' style={{background: leagueColor, color: getContrastTextColor(leagueColor)}}>
                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-7xl flex-shrink-0 cursor-pointer">
                            {leagueEmoji}
                        </button>
                        <div className="absolute inset-0 flex flex-col items-center justify-center px-2 pointer-events-none">
                            <span className="text-2xl font-bold tracking-wide leading-tight text-center">
                                <input type="text" value={leagueName} onChange={(e) => setLeagueName(e.target.value)} className="w-32 text-2xl font-bold text-center border-b-2 border-theme-accent border-opacity-50 py-1 focus:outline-none pointer-events-auto" maxLength={24} required/> League
                            </span>
                            <span>
                                Custom League
                            </span>
                        </div>
                    </div>
                    {showEmojiPicker && (
                        <div className="absolute z-10 -translate-x-1/2 left-1/2 mt-2">
                            <Picker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide opacity-70 leading-tight">League Color</label>
                        <input type="color" value={leagueColor} onChange={(e) => setLeagueColor(e.target.value)} className="w-24 h-12 rounded-md cursor-pointer" required/>
                    </div>

                    <div>
                        <button type='submit' disabled={status === 'submitting'} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                            {status === 'submitting' ? 'Creating...' : 'Create League'}
                        </button>
                        {status === 'success' && <div className="text-theme-text text-sm">League created successfully!</div>}
                        {status === 'error' && <div className="text-theme-secondary text-sm">Error creating league. Please try again.</div>} 
                    </div>

                </form>
            </div>
        </main>
    );
}