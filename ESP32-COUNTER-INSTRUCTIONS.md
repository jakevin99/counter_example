# ESP32 People Counter - Troubleshooting Guide

## Issue: ESP32 not sending data to the counter application

We identified that the ESP32 device is programmed to send data to port 3000, but the main SvelteKit application is running on a different port. This guide provides several solutions to fix the communication.

## Solution 1: Use the Test Server (Recommended First Step)

The test server is a simple server that listens on port 3000 and logs all incoming requests. This is useful to verify that the ESP32 is actually sending data correctly.

1. Run the test server:
   ```
   npm run test-server
   ```

2. If the ESP32 is working correctly, you should see messages in the console whenever the device detects entries or exits. This confirms the ESP32 is sending data to the correct port.

## Solution 2: Run the Proxy Server with the SvelteKit App

The proxy server allows the ESP32 to communicate with the SvelteKit app by forwarding requests from port 3000 to the SvelteKit port.

1. Run both servers at once:
   ```
   npm run start
   ```

2. Access the main counter application at:
   ```
   http://192.168.43.44:5174/
   ```

3. To check the connection status, visit the debug page:
   ```
   http://192.168.43.44:5174/debug
   ```

## Solution 3: Build and Deploy the App (Production)

For a production environment:

1. Build the application:
   ```
   npm run build
   ```

2. Serve the built application on port 3000:
   ```
   npm run preview -- --host --port 3000
   ```

## Troubleshooting

### What to check if the counter isn't updating:

1. **Check connectivity**:
   - Make sure the ESP32 and the computer running the server are on the same network
   - Verify the ESP32 has the correct server IP address configured

2. **Verify ESP32 is sending data**:
   - Run `npm run test-server` to see if the ESP32 is sending data
   - Check if entries/exits are being detected in the ESP32 serial console

3. **Debug the connection**:
   - Visit the debug page at `/debug` to monitor the connection status
   - Use the "Send Test Entry" button to verify the server is working

4. **Test direct API communication**:
   - Send a test request to `http://192.168.43.44:3000/api/counters` with:
     ```json
     {
       "deviceId": "ESP_CounterDevice",
       "entries": 1,
       "exits": 0,
       "timestamp": 1234567890
     }
     ```

### Common Issues:

1. **Port 3000 is already in use**:
   - Check if another application is using port 3000 (like another Svelte app)
   - Use `netstat -a -n -o | findstr :3000` to find and stop the process using port 3000

2. **ESP32 firmware URL**:
   - The ESP32 firmware is hardcoded to send to `http://192.168.43.44:3000/api/counters`
   - Use the config page to set the correct URL if your IP address or port is different

3. **CORS issues**:
   - The proxy server handles CORS, but if you're seeing CORS errors in the browser console, check that the server is running correctly

## Files Explanation

- `proxy-server.js`: Forwards requests from port 3000 to the SvelteKit port
- `test-server.js`: Simple server that logs all requests to port 3000
- `start-servers.js`: Runs both the SvelteKit app and proxy server together
- `/debug` page: Real-time monitoring of the connection status

## Next Steps

After verifying the ESP32 is sending data correctly with the test server, try running the full application with the proxy server. If you're still having issues, use the debug page to diagnose the problem. 