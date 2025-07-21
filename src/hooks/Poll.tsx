import { useEffect, useRef } from "react";

type PollingOptions<T> = {
    interval: number;
    pollFn: () => Promise<T>;
    onData: (data: T) => void;
    shouldStop?: (data: T) => boolean;
    maxFailures?: number;
    maxRepeat?: number;
};

export function usePolling<T>({interval, pollFn, onData, shouldStop = () => false, maxFailures = 5, maxRepeat = 5,}: PollingOptions<T>) {
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const failureCountRef = useRef(0);
    const lastResultRef = useRef<string | null>(null);
    const repeatCountRef = useRef(0);

    useEffect(() => {
        let isMounted = true;

        async function poll() {
            if (!isMounted) return;

            try {
                const result = await pollFn();
                if (!isMounted) return;

                const resultKey = JSON.stringify(result);
                if (resultKey === lastResultRef.current) {
                    repeatCountRef.current++;
                    if (repeatCountRef.current >= maxRepeat) {
                        console.warn("Polling stopped due to repeated identical results.");
                        stopPolling();
                        return;
                    }
                } else {
                    repeatCountRef.current = 0;
                    lastResultRef.current = resultKey;
                }

                onData(result);

                if (shouldStop(result)) {
                    stopPolling();
                } else {
                    failureCountRef.current = 0;
                }
            } catch (err) {
                console.error(err);
                failureCountRef.current++;
                if (failureCountRef.current >= maxFailures) {
                    console.warn("Polling stopped after repeated failures.");
                    stopPolling();
                }
            }
        }

        function stopPolling() {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        }

        pollingRef.current = setInterval(poll, interval);
        poll();

        return () => {
            isMounted = false;
            stopPolling();
        };
    }, [pollFn]);
}
