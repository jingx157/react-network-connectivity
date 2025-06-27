# react-network-connectivity

## Features

- **Accurate connectivity detection** by active HTTP ping with fallback to browser status - **Latency measurement** with
  real-time updates and automatic timeout handling - **Exponential backoff** retries to reduce network load on unstable
  connections - **Predictive network status** including an "unstable" state for slow/high-latency connections - **Easy
  React integration** via Context provider and simple hook for status consumption - **Customizable visual indicators**
  with multiple styles and icon sets (including Lucide icons)  - **Callbacks** for reacting to status changes,
  online/offline transitions  
  --- A powerful and flexible React package for detecting and displaying network connectivity status. It combines active
  ping monitoring with timeout, exponential backoff retries, latency tracking, and predictive statuses (`online`,
  `offline`, `unstable`, `checking`). This package provides a React Context provider (`<NetworkProvider>`) and a
  convenient hook (`useNetworkStatus`) for easy access to real-time network state anywhere in your app. Additionally, it
  offers a customizable Wi-Fi signal indicator component (`<WifiSignalIndicator>`) with multiple visual styles to suit
  different UI needs. ---

## Installation

Install the package and its peer dependency for icons:

```bash
npm install react-network-connectivity lucide-react
# or
yarn add react-network-connectivity lucide-react
```

--- ## Usage

### Wrap your app with the Provider

The `NetworkProvider` manages active network checks by pinging a specified URL (or falling back to browser status) at
configurable intervals, with built-in retry and backoff logic:

```tsx
import {NetworkProvider} from 'react-network-connectivity';

<NetworkProvider pingUrl="https://your-api/ping" pingIntervalMs={15000}>
    <YourApp/>
</NetworkProvider>
```

### Consume network status via Hook

Anywhere inside your app, use the `useNetworkStatus` hook to get up-to-date status, latency, and connection info:

```tsx
import {useNetworkStatus} from 'react-network-connectivity';

function StatusDisplay() {
    const {isOnline, status, latency, retryPing} = useNetworkStatus();
    return (
        <div>
            <p>Status: {status} (Latency: {latency ? `${latency.toFixed(0)} ms` : 'N/A'})</p>
            {!isOnline && <button onClick={retryPing}>Retry Now</button>}
        </div>
    );
}
```

### Visualize connectivity with Wi-Fi indicator

Use the `<WifiSignalIndicator />` component to render network quality visually, with multiple styles:

```tsx
import {WifiSignalIndicator} from 'react-network-connectivity';

<WifiSignalIndicator variant="lucide" showLabel size={30}/>
```

Supported variants: `'bars'`, `'icon'`, `'text'`, `'emoji'`, `'lucide'`.
---

## API

### `<NetworkProvider />` Props

| Prop             | Type                                   | Default     | Description                                                              |
|------------------|----------------------------------------|-------------|--------------------------------------------------------------------------|
| `pingUrl`        | `string`                               | `undefined` | URL to ping to check connectivity; fallback to browser status if omitted |
| `pingIntervalMs` | `number`                               | `15000`     | Interval between ping attempts (ms)                                      |
| `timeoutMs`      | `number`                               | `3000`      | Timeout for each ping request (ms)                                       |
| `backoff`        | `boolean`                              | `true`      | Enables exponential backoff on failures                                  |
| `maxBackoffMs`   | `number`                               | `60000`     | Maximum delay for backoff (ms)                                           |
| `onStatusChange` | `(status: ConnectivityStatus) => void` | `undefined` | Callback when status changes                                             |
| `onOnline`       | `() => void`                           | `undefined` | Callback when going online                                               |
| `onOffline`      | `() => void`                           | `undefined` | Callback when going offline                                              |

### `useNetworkStatus()` Returns

```ts
{
    isOnline: boolean; // true if status is 'online' or 'unstable'
    status: 'online' | 'offline' | 'unstable' | 'checking'; // network connectivity status
    latency: number | null; // ping latency in milliseconds or null if unknown
    lastChecked: Date | null; // timestamp of last ping attempt
    lastSuccessAt: Date | null; // timestamp of last successful ping
    error ? : string; // optional error message if ping failed
    retryPing: () => void; // manually trigger a ping attempt
}
```

### `<WifiSignalIndicator />` Props

| Prop        | Type      | Default | Description                          |
|-------------|-----------|---------|--------------------------------------|
| `variant`   | `'bars'   | 'icon'  | 'text'                               | 'emoji' | 'lucide'` | `'bars'` | Visual style of the indicator                    |
| `showLabel` | `boolean` | `false` | Whether to show textual status label |
| `size`      | `number`  | `20`    | Icon size in pixels                  |

---

## License

MIT © Jingx
---
Feel free to contribute or report issues on [GitHub](https://github.com/jingx157/react-network-connectivity).
