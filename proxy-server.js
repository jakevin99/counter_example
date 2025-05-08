// proxy-server.js
// A simple proxy server to listen on port 3000 and forward to the SvelteKit app
// This helps with the ESP32 device that expects to communicate on port 3000

import http from 'http';
import https from 'https';
import { URL } from 'url';

// Configuration
const PORT = 3000;
const TARGET_HOST = 'localhost';
const TARGET_PORT = 5174; // SvelteKit development server port (can be changed based on what's available)

// Create the proxy server
const server = http.createServer((req, res) => {
  // Log the request
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  
  // Parse the requested URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  
  // Prepare options for the proxied request
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    // Rewrite URL path from /api/counter/update to /api/counters for compatibility
    path: parsedUrl.pathname.includes('/api/counter/update') 
          ? '/api/counters' 
          : parsedUrl.pathname + parsedUrl.search,
    method: req.method,
    headers: req.headers
  };
  
  console.log(`Forwarding to: ${options.path}`);
  
  // Handle potential CORS issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request separately (for CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Create the proxied request
  const proxy = http.request(options, (proxyRes) => {
    // Set headers from the target response
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Pipe data from target response to our response
    proxyRes.pipe(res, { end: true });
  });
  
  // Handle errors in the proxy request
  proxy.on('error', (error) => {
    console.error(`Proxy Error: ${error.message}`);
    res.writeHead(502); // Bad Gateway
    res.end(`Proxy Error: ${error.message}`);
  });
  
  // Pipe original request data to the proxy request
  req.pipe(proxy, { end: true });
});

// Start listening
server.listen(PORT, () => {
  console.log(`\n=== ESP32 People Counter Proxy Server ===`);
  console.log(`Listening on port: ${PORT}`);
  console.log(`Forwarding to: ${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`URL Path Mapping: /api/counter/update → /api/counters`);
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log(`Press Ctrl+C to stop\n`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use.`);
    console.error(`The ESP32 device might already be connected to another server on port ${PORT}.`);
    console.error(`Close that server first or choose a different port in the ESP32 firmware.`);
  } else {
    console.error(`Server error: ${error.message}`);
  }
}); 