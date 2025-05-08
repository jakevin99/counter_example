// start-servers.js
// Runs both the SvelteKit development server and the proxy server

import { spawn } from 'child_process';
import { createInterface } from 'readline';

console.log('=== ESP32 People Counter - Starting Servers ===');

// Start the SvelteKit dev server
const svelteKit = spawn('npm', ['run', 'dev', '--', '--host'], {
  shell: true,
  stdio: 'pipe'
});

// Start the proxy server
const proxy = spawn('node', ['proxy-server.js'], {
  shell: true,
  stdio: 'pipe'
});

// Helper to prefix and color logs
function prefixLogs(stream, prefix, color) {
  const rl = createInterface({ input: stream });
  rl.on('line', (line) => {
    console.log(`${color}[${prefix}] ${line}\x1b[0m`);
  });
}

// Set up logging for SvelteKit
prefixLogs(svelteKit.stdout, 'SvelteKit', '\x1b[36m'); // Cyan
prefixLogs(svelteKit.stderr, 'SvelteKit', '\x1b[36m');

// Set up logging for Proxy
prefixLogs(proxy.stdout, 'Proxy', '\x1b[33m'); // Yellow
prefixLogs(proxy.stderr, 'Proxy', '\x1b[33m');

// Handle process termination
function cleanup() {
  console.log('\n=== Shutting down servers ===');
  
  svelteKit.kill();
  proxy.kill();
  
  process.exit(0);
}

// Listen for termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Handle server crashes
svelteKit.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[SvelteKit] Process exited with code ${code}\x1b[0m`);
    cleanup();
  }
});

proxy.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[Proxy] Process exited with code ${code}\x1b[0m`);
    cleanup();
  }
});

console.log('\n=== Both servers starting... ===');
console.log('Press Ctrl+C to stop all servers\n'); 