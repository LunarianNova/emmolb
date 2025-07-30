'use client';
import { EditLeague } from "@/components/leagues/EditCustomLeague";
import { useState } from "react";

export default function CreateLeague() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    return (
        <div className="min-h-screen">
            <EditLeague status={status} setStatus={setStatus}/>
        </div>
    );
}