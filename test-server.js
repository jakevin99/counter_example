// test-server.js
// A simple test server that just listens on port 3000 and logs requests
// This helps verify that the ESP32 device is actually sending data to this server

import http from 'http';

const PORT = 3000;

// Create a simple server
const server = http.createServer((req, res) => {
  // Get the current time
  const now = new Date();
  const timestamp = now.toLocaleTimeString();
  
  // Log information about the request
  console.log(`\n=== REQUEST RECEIVED AT ${timestamp} ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
  
  // Handle POST requests (to capture data from ESP32)
  if (req.method === 'POST') {
    let body = '';
    
    // Collect the request body
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    // When the request is complete
    req.on('end', () => {
      console.log(`Body: ${body}`);
      
      try {
        // Try to parse the body as JSON
        const jsonData = JSON.parse(body);
        console.log('Parsed JSON data:');
        console.log(JSON.stringify(jsonData, null, 2));
        
        // Check if this is counter data
        if (jsonData.deviceId && (jsonData.entries !== undefined || jsonData.exits !== undefined)) {
          console.log('\n=== COUNTER EVENT DETECTED ===');
          console.log(`Device ID: ${jsonData.deviceId}`);
          if (jsonData.entries > 0) {
            console.log(`ENTRY EVENT: ${jsonData.entries} person(s) entered`);
          }
          if (jsonData.exits > 0) {
            console.log(`EXIT EVENT: ${jsonData.exits} person(s) exited`);
          }
        }
      } catch (e) {
        console.log('Not valid JSON data');
      }
      
      // Send a simple success response back to the device
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Data received',
        timestamp: Date.now() 
      }));
    });
  } else {
    // For non-POST requests, just send a simple response
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ESP32 Counter Test Server is running');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`ESP32 Counter Test Server`);
  console.log(`Listening on port ${PORT}`);
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log(`----------------------------------------`);
  console.log(`Waiting for requests from the ESP32...`);
  console.log(`Press Ctrl+C to stop the server`);
  console.log(`========================================\n`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use.`);
    console.error(`Another server might be running on this port.`);
    console.error(`Please stop that server first or choose a different port.`);
  } else {
    console.error(`Server error: ${err.message}`);
  }
}); 