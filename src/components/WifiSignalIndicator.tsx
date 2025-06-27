import React, {useEffect, useRef} from 'react';
import {useNetworkStatus} from '../hooks/useNetworkStatus';
import {SignalHigh, SignalLow, SignalMedium, Wifi, WifiOff} from 'lucide-react';
import {ConnectivityStatus} from "../provider/NetworkProvider";

type Variant = 'bars' | 'icon' | 'text' | 'emoji' | 'lucide';
type LatencyPosition = 'below' | 'right';

interface WifiSignalIndicatorColors {
    offline?: string;
    unstable?: string;
    online?: string;
    signalBars?: string[];
}

interface WifiSignalIndicatorLabels {
    offline?: string;
    unstable?: string;
    checking?: string;
    online?: string;
}

interface WifiSignalIndicatorProps {
    variant?: Variant;
    showLabel?: boolean;
    showLatency?: boolean;
    latencyPosition?: LatencyPosition;
    size?: number;
    colors?: WifiSignalIndicatorColors;
    labels?: WifiSignalIndicatorLabels;
    signalThresholds?: number[];
    onStatusChange?: (status: ConnectivityStatus) => void;
    onLatencyChange?: (latency: number | null) => void;
}

const defaultColors: WifiSignalIndicatorColors = {
    offline: '#f44336',
    unstable: '#ff9800',
    online: '#4caf50',
    signalBars: ['#ccc', '#999', '#0f0', '#080'],
};

const defaultLabels: WifiSignalIndicatorLabels = {
    offline: 'Offline',
    unstable: 'Unstable',
    checking: 'Checking...',
    online: 'Online',
};

const getSignalLevel = (latency: number | null, thresholds: number[]): number => {
    if (latency == null) return 0;
    for (let i = thresholds.length - 1; i >= 0; i--) {
        if (latency < thresholds[i]) return i + 1;
    }
    return 1;
};

export const WifiSignalIndicator: React.FC<WifiSignalIndicatorProps> = ({
                                                                            variant = 'bars',
                                                                            showLabel = false,
                                                                            showLatency = false,
                                                                            latencyPosition = 'below',
                                                                            size = 20,
                                                                            colors,
                                                                            labels,
                                                                            signalThresholds,
                                                                            onStatusChange,
                                                                            onLatencyChange,
                                                                        }) => {
    const {status, latency, isOnline} = useNetworkStatus();

    const mergedColors = {...defaultColors, ...colors};
    const mergedLabels = {...defaultLabels, ...labels};
    const thresholds = signalThresholds ?? [100, 300, 600];

    const signal = isOnline ? getSignalLevel(latency, thresholds) : 0;

    // Callbacks for status & latency change
    const prevStatus = useRef<ConnectivityStatus | null>(null);
    const prevLatency = useRef<number | null>(null);

    useEffect(() => {
        if (status !== prevStatus.current) {
            onStatusChange?.(status);
            prevStatus.current = status;
        }
    }, [status, onStatusChange]);

    useEffect(() => {
        if (latency !== prevLatency.current) {
            onLatencyChange?.(latency);
            prevLatency.current = latency;
        }
    }, [latency, onLatencyChange]);

    const label = (() => {
        switch (status) {
            case 'offline':
                return mergedLabels.offline;
            case 'checking':
                return mergedLabels.checking;
            case 'unstable':
                return mergedLabels.unstable;
            case 'online':
            default:
                return mergedLabels.online;
        }
    })();

    const renderBars = () => (
        <div style={{display: 'flex', alignItems: 'flex-end'}}>
            {Array.from({length: 4}, (_, i) => (
                <div
                    key={i}
                    style={{
                        width: size / 5,
                        height: (i + 1) * (size / 5),
                        backgroundColor:
                            signal > i
                                ? mergedColors.signalBars?.[i] ?? defaultColors.signalBars?.[i]
                                : mergedColors.signalBars?.[0] ?? defaultColors.signalBars?.[0],
                        marginRight: 2,
                        borderRadius: 2,
                        transition: 'all 0.3s',
                    }}
                />
            ))}
        </div>
    );

    const renderIcon = () => {
        const color = !isOnline
            ? mergedColors.offline
            : status === 'unstable'
                ? mergedColors.unstable
                : mergedColors.online;

        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'inline-block',
                }}
                title={label}
            />
        );
    };

    const renderText = () => (
        <span style={{color: isOnline ? mergedColors.online : mergedColors.offline}}>
      {label}
    </span>
    );

    const renderEmoji = () => {
        if (!isOnline) return <span>❌</span>;
        if (status === 'checking') return <span>🔄</span>;
        if (status === 'unstable') return <span>📶⚠️</span>;

        return ['📶', '📶📶', '📶📶📶', '📶📶📶📶'][signal - 1] || '📶';
    };

    const renderLucide = () => {
        if (!isOnline) return <WifiOff size={size} color={mergedColors.offline}/>;
        if (status === 'unstable')
            return <SignalLow size={size} color={mergedColors.unstable}/>;

        switch (signal) {
            case 1:
                return <SignalLow size={size} color="#999"/>;
            case 2:
                return <SignalMedium size={size} color="#999"/>;
            case 3:
                return <SignalHigh size={size} color={mergedColors.online}/>;
            case 4:
                return <Wifi size={size} color={mergedColors.online}/>;
            default:
                return <Wifi size={size} color="#999"/>;
        }
    };

    const content = {
        bars: renderBars(),
        icon: renderIcon(),
        text: renderText(),
        emoji: renderEmoji(),
        lucide: renderLucide(),
    }[variant];

    const isBelow = latencyPosition === 'below';

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isBelow ? 'column' : 'row',
                alignItems: 'center',
                gap: 4,
            }}
            aria-label={`Network status: ${label}, latency ${
                latency ? latency.toFixed(0) + ' ms' : 'N/A'
            }`}
            role="img"
        >
            {content}

            {showLabel && variant !== 'text' && (
                <span style={{fontSize: 12, color: '#333'}}>{label}</span>
            )}

            {showLatency && latency !== null && (
                <span
                    style={{
                        fontSize: 10,
                        color: '#666',
                        marginTop: isBelow ? 2 : 0,
                        marginLeft: !isBelow ? 6 : 0,
                    }}
                >
          {latency.toFixed(0)} ms
        </span>
            )}
        </div>
    );
};
