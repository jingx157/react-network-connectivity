import React, {createContext, ReactNode, useContext, useEffect, useRef, useState,} from 'react';

export type ConnectivityStatus = 'online' | 'offline' | 'unstable' | 'checking';

export interface NetworkContextProps {
    isOnline: boolean;
    status: ConnectivityStatus;
    latency: number | null;
    lastChecked: Date | null;
    lastSuccessAt: Date | null;
    error?: string;
    retryPing: () => void;
}

const NetworkContext = createContext<NetworkContextProps>({
    isOnline: true,
    status: 'checking',
    latency: null,
    lastChecked: null,
    lastSuccessAt: null,
    retryPing: () => {
    },
});

interface NetworkProviderProps {
    children: ReactNode;
    pingUrl?: string;
    pingIntervalMs?: number;
    timeoutMs?: number;
    backoff?: boolean;
    maxBackoffMs?: number;
    onStatusChange?: (status: ConnectivityStatus) => void;
    onOnline?: () => void;
    onOffline?: () => void;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
                                                                    children,
                                                                    pingUrl = "https://www.google.com/generate_204",
                                                                    pingIntervalMs = 15000,
                                                                    timeoutMs = 3000,
                                                                    backoff = true,
                                                                    maxBackoffMs = 60000,
                                                                    onStatusChange,
                                                                    onOnline,
                                                                    onOffline,
                                                                }) => {
    const [status, setStatus] = useState<ConnectivityStatus>('checking');
    const [latency, setLatency] = useState<number | null>(null);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const [lastSuccessAt, setLastSuccessAt] = useState<Date | null>(null);
    const [error, setError] = useState<string>();
    const retryCountRef = useRef(0);
    const backoffTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


    const isOnline = status === 'online' || status === 'unstable';

    // Ping logic with backoff and predictive status
    const ping = async () => {
        if (!pingUrl) {
            // fallback to navigator.onLine
            const online = navigator.onLine;
            updateStatus(online ? 'online' : 'offline', null, null, online ? undefined : 'offline fallback');
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const start = performance.now();
        try {
            const res = await fetch(pingUrl, {signal: controller.signal, cache: 'no-cache'});
            clearTimeout(timeout);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const latencyMs = performance.now() - start;
            updateStatus('online', latencyMs, new Date(), undefined);
            retryCountRef.current = 0;
            setLastSuccessAt(new Date());
        } catch (err: any) {
            clearTimeout(timeout);
            retryCountRef.current++;
            updateStatus('offline', null, null, err.message || 'Ping failed');
            scheduleRetry();
        }
    };

    const scheduleRetry = () => {
        if (!backoff) {
            setTimeout(ping, pingIntervalMs);
            return;
        }
        const backoffMs = Math.min(
            pingIntervalMs * 2 ** retryCountRef.current,
            maxBackoffMs
        );

        backoffTimeoutRef.current = setTimeout(ping, backoffMs);
    };

    const updateStatus = (
        newStatus: ConnectivityStatus,
        latency: number | null,
        checkedAt: Date | null,
        errorMsg?: string
    ) => {
        setLatency(latency);
        setLastChecked(checkedAt);
        setError(errorMsg);

        // Predict unstable if latency high (>500ms)
        let finalStatus = newStatus;
        if (newStatus === 'online' && latency !== null && latency > 500) {
            finalStatus = 'unstable';
        }

        if (finalStatus !== status) {
            setStatus(finalStatus);
            onStatusChange?.(finalStatus);
            if (finalStatus === 'online') onOnline?.();
            if (finalStatus === 'offline') onOffline?.();
        }
    };

    // retry ping manual trigger
    const retryPing = () => {
        retryCountRef.current = 0;
        backoffTimeoutRef.current && clearTimeout(backoffTimeoutRef.current);
        ping();
    };

    useEffect(() => {
        ping();

        const interval = setInterval(() => {
            ping();
        }, pingIntervalMs);

        const onOnlineHandler = () => {
            retryPing();
        };
        const onOfflineHandler = () => {
            updateStatus('offline', null, null, 'Browser offline event');
        };

        window.addEventListener('online', onOnlineHandler);
        window.addEventListener('offline', onOfflineHandler);

        return () => {
            clearInterval(interval);
            backoffTimeoutRef.current && clearTimeout(backoffTimeoutRef.current);
            window.removeEventListener('online', onOnlineHandler);
            window.removeEventListener('offline', onOfflineHandler);
        };
    }, []);

    return (
        <NetworkContext.Provider
            value={{
                isOnline,
                status,
                latency,
                lastChecked,
                lastSuccessAt,
                error,
                retryPing,
            }}
        >
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetworkStatus = () => useContext(NetworkContext);
