'use client';
import { EditLeague } from "@/components/EditCustomLeague";
import { useState } from "react";

export default function CreateLeague() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto h-full">
                <EditLeague status={status} setStatus={setStatus}/>
            </div>
        </main>
    );
}