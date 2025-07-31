'use client';
import { useState, useEffect } from 'react';

export function useAccount() {
    const [user, setUser] = useState<{ username: string, team_id?: string, settings?: Record<any, any> } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/nextapi/db/account', { credentials: 'include' });
                if (!res.ok) throw new Error('Unauthorized');
                const data = await res.json();
                setUser(data);
            } catch (e: any) {
                setUser(null);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    return { user, loading, error };
}
