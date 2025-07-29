import { useEffect, useState } from "react";

export function useApi<T>(url: string, dependencies: any[] = []): {data: T | null, loading: boolean, error: any} {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        fetch(url).then(res => {
                if (!res.ok) throw new Error(`HTTP Code ${res.status}`);
                return res.json();
            })
            .then(json => {if (isMounted) setData(json)})
            .catch(err => {if (isMounted) setError(err)})
            .finally(() => {if (isMounted) setLoading(false)})

        return () => {isMounted = false};
    }, dependencies);

    return {data, loading, error};
}