# ESP32 People Counter Web Interface

This is a simple web interface for monitoring and testing the ESP32 People Counter device, which uses a VL53L1X Time-of-Flight sensor to detect people entering and exiting through a doorway.

## Features

- **Real-time Counter Display**: View current count of people, total entries and exits
- **Event Log**: See recent entry and exit events
- **Test Tool**: Simulate device events to test the interface
- **Configuration**: Manage device settings including server URL and update interval
- **Type-Safe API**: All endpoints use TypeScript interfaces for data validation

## Project Structure

- **Main Counter Display**: Shows the current people count and event history
- **Test Tool**: Allows simulation of entry/exit events from the ESP32 device
- **Configuration**: Manage connection settings for the ESP32 device
- **API Endpoints**: Receive counter data and manage device settings

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the web interface at: `http://localhost:3000`

## API Endpoints

### `/api/counters` (POST)

Receives counter data from the ESP32 device.

**Request Format:**
```json
{
  "deviceId": "ESP_CounterDevice",
  "entries": 1,
  "exits": 0,
  "timestamp": 1618724567890
}
```

### `/api/counters` (GET)

Retrieves the current counter data.

**Response Format:**
```json
{
  "totalEntries": 10,
  "totalExits": 5,
  "peopleCount": 5,
  "eventHistory": [...]
}
```

### `/api/config` (GET/POST)

Get or update device configuration settings.

**Example Configuration:**
```json
{
  "serverUrl": "http://your-server:3000/api/counters",
  "deviceName": "ESP_CounterDevice",
  "updateInterval": 5000
}
```

## Type Definitions

The application uses TypeScript for type safety. Key interfaces include:

```typescript
// Event data
interface CounterEvent {
  type: 'entry' | 'exit';
  timestamp: Date;
  deviceTimestamp: number;
  deviceId: string;
}

// Configuration settings
interface ServerSettings {
  serverUrl: string;
  deviceName: string;
  updateInterval: number;
}
```

## ESP32 Firmware

The ESP32 firmware sends HTTP POST requests to the `/api/counters` endpoint whenever an entry or exit is detected. The device should be configured with the correct server URL.

## Development

This project is built with:

- [SvelteKit](https://kit.svelte.dev/)
- TypeScript

## License

MIT License
