import React from 'react';
import {NetworkProvider} from './provider/NetworkProvider';
import {WifiSignalIndicator} from './components/WifiSignalIndicator';
import {useNetworkStatus} from './hooks/useNetworkStatus';

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({title, children}) => (
    <div style={{marginBottom: 24}}>
        <h3 style={{marginBottom: 8}}>{title}</h3>
        <div>{children}</div>
    </div>
);

const LatencyDisplay: React.FC = () => {
    const {latency, status} = useNetworkStatus();
    return (
        <div style={{marginTop: 8, fontSize: 14, color: '#555'}}>
            <strong>Latency:</strong> {latency ? `${latency.toFixed(0)}ms` : 'N/A'} ({status})
        </div>
    );
};

const App = () => {
    return (
        <NetworkProvider
            pingUrl="https://jsonplaceholder.typicode.com/posts/1"
            pingIntervalMs={5000}
        >
            <div style={{fontFamily: 'sans-serif', padding: 32}}>
                <h1>📶 Network Connectivity Playground</h1>

                <Section title="Bars Variant">
                    <WifiSignalIndicator variant="bars" showLabel/>
                    <LatencyDisplay/>
                </Section>

                <Section title="Icon Variant">
                    <WifiSignalIndicator variant="icon" showLabel/>
                    <LatencyDisplay/>
                </Section>

                <Section title="Text Variant">
                    <WifiSignalIndicator variant="text"/>
                    <LatencyDisplay/>
                </Section>

                <Section title="Emoji Variant">
                    <WifiSignalIndicator variant="emoji" showLabel/>
                    <LatencyDisplay/>
                </Section>

                <Section title="Lucide Icon Variant">
                    <WifiSignalIndicator variant="lucide" size={32} showLabel/>
                    <LatencyDisplay/>
                </Section>
            </div>
        </NetworkProvider>
    );
};

export default App;
