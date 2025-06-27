import React from 'react';
import {useNetworkStatus} from '../hooks/useNetworkStatus';
import {SignalHigh, SignalLow, SignalMedium, Wifi, WifiOff,} from 'lucide-react';

type Variant = 'bars' | 'icon' | 'text' | 'emoji' | 'lucide';

interface WifiSignalIndicatorProps {
    variant?: Variant;
    showLabel?: boolean;
    size?: number;
}

const getSignalLevel = (latency: number | null): number => {
    if (latency == null) return 0;
    if (latency < 100) return 4;
    if (latency < 300) return 3;
    if (latency < 600) return 2;
    return 1;
};

export const WifiSignalIndicator: React.FC<WifiSignalIndicatorProps> = ({
                                                                            variant = 'bars',
                                                                            showLabel = false,
                                                                            size = 20,
                                                                        }) => {
    const {status, latency, isOnline} = useNetworkStatus();
    const signal = isOnline ? getSignalLevel(latency) : 0;

    const label =
        status === 'offline'
            ? 'Offline'
            : status === 'checking'
                ? 'Checking...'
                : status === 'unstable'
                    ? 'Unstable'
                    : 'Online';

    const renderBars = () => (
        <div style={{display: 'flex', alignItems: 'flex-end'}}>
            {Array.from({length: 4}, (_, i) => (
                <div
                    key={i}
                    style={{
                        width: size / 5,
                        height: (i + 1) * (size / 5),
                        backgroundColor: signal > i ? '#0f0' : '#ccc',
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
            ? '#f00'
            : status === 'unstable'
                ? '#ff0'
                : '#0f0';

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
        <span style={{color: isOnline ? 'green' : 'red'}}>{label}</span>
    );

    const renderEmoji = () => {
        if (!isOnline) return <span>❌</span>;
        if (status === 'checking') return <span>🔄</span>;
        if (status === 'unstable') return <span>📶⚠️</span>;

        return ['📶', '📶📶', '📶📶📶', '📶📶📶📶'][signal - 1] || '📶';
    };

    const renderLucide = () => {
        if (!isOnline) return <WifiOff size={size} color="red"/>;
        if (status === 'unstable') return <SignalLow size={size} color="orange"/>;

        switch (signal) {
            case 1:
                return <SignalLow size={size} color="gray"/>;
            case 2:
                return <SignalMedium size={size} color="#999"/>;
            case 3:
                return <SignalHigh size={size} color="green"/>;
            case 4:
                return <Wifi size={size} color="green"/>;
            default:
                return <Wifi size={size} color="gray"/>;
        }
    };

    const content = {
        bars: renderBars(),
        icon: renderIcon(),
        text: renderText(),
        emoji: renderEmoji(),
        lucide: renderLucide(),
    }[variant];

    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            {content}
            {showLabel && variant !== 'text' && (
                <span style={{marginLeft: 8, fontSize: 12}}>{label}</span>
            )}
        </div>
    );
};
