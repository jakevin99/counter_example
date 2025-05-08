<script lang="ts">
  // Import necessary Svelte functionality
  import { onMount, onDestroy } from 'svelte';
  
  // Interface for counter data
  interface CounterStatus {
    totalEntries: number;
    totalExits: number;
    peopleCount: number;
    lastCheck: Date;
    isConnected: boolean;
    checkCount: number;
    failCount: number;
  }
  
  // State variables
  let counterStatus: CounterStatus = {
    totalEntries: 0,
    totalExits: 0,
    peopleCount: 0,
    lastCheck: new Date(),
    isConnected: false,
    checkCount: 0,
    failCount: 0
  };
  
  let targetServer = "http://192.168.43.44:3000/api/counters";
  let targetDevice = "ESP_CounterDevice";
  let checkInterval = 2000; // milliseconds
  let checkTimer: ReturnType<typeof setInterval> | null = null;
  let logs: string[] = [];
  let testMessage = "Testing connection...";
  
  // Setup auto-checking when component mounts
  onMount(() => {
    // Start checking
    startChecking();
  });
  
  // Clean up interval when component unmounts
  onDestroy(() => {
    stopChecking();
  });
  
  // Function to start periodic checks
  function startChecking() {
    if (checkTimer) clearInterval(checkTimer);
    
    // Immediately run a check
    checkConnection();
    
    // Set up regular checks
    checkTimer = setInterval(checkConnection, checkInterval);
    addLog("Started connection monitoring");
  }
  
  // Function to stop periodic checks
  function stopChecking() {
    if (checkTimer) {
      clearInterval(checkTimer);
      checkTimer = null;
      addLog("Stopped connection monitoring");
    }
  }
  
  // Function to check connection to counter API
  async function checkConnection() {
    counterStatus.checkCount++;
    counterStatus.lastCheck = new Date();
    
    try {
      // Try to fetch data from the counter API
      const response = await fetch(targetServer);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update connection status
        counterStatus.isConnected = true;
        counterStatus.totalEntries = data.totalEntries;
        counterStatus.totalExits = data.totalExits;
        counterStatus.peopleCount = data.peopleCount;
        
        // Log if this is a recovery from failure
        if (counterStatus.failCount > 0) {
          addLog(`Connection restored after ${counterStatus.failCount} failures`);
          counterStatus.failCount = 0;
        }
      } else {
        handleConnectionFailure(`API returned status ${response.status}`);
      }
    } catch (error) {
      handleConnectionFailure(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Force Svelte to update the component
    counterStatus = {...counterStatus};
  }
  
  // Function to handle connection failures
  function handleConnectionFailure(reason: string) {
    // Only log the first failure and every 5th subsequent failure to avoid spam
    const shouldLog = counterStatus.failCount === 0 || counterStatus.failCount % 5 === 0;
    
    counterStatus.isConnected = false;
    counterStatus.failCount++;
    
    if (shouldLog) {
      addLog(`Connection failed: ${reason}`);
    }
  }
  
  // Function to add an entry to the log
  function addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    logs = [`[${timestamp}] ${message}`, ...logs.slice(0, 49)]; // Keep last 50 logs
  }
  
  // Function to send test data
  async function sendTestData() {
    addLog("Sending test data to counter API...");
    testMessage = "Sending...";
    
    try {
      // Prepare payload similar to ESP32 device
      const payload = {
        deviceId: targetDevice,
        entries: 1,
        exits: 0,
        timestamp: Date.now()
      };
      
      // Send POST request to the counter API
      const response = await fetch(targetServer, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        testMessage = `Test successful! Server responded: ${JSON.stringify(data)}`;
        addLog("Test data sent successfully");
      } else {
        testMessage = `Error: Server returned ${response.status}`;
        addLog(`Test failed: Server returned ${response.status}`);
      }
    } catch (error) {
      testMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
      addLog(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Function to clear logs
  function clearLogs() {
    logs = [];
    addLog("Logs cleared");
  }
  
  // Format timestamp for display
  function formatTime(date: Date): string {
    return date.toLocaleTimeString();
  }
</script>

<svelte:head>
  <title>ESP32 Counter Debug</title>
</svelte:head>

<main>
  <div class="container">
    <header>
      <h1>ESP32 People Counter Debug</h1>
      <p class="subtitle">Connection diagnostics and testing</p>
    </header>
    
    <!-- Connection status -->
    <div class="status-panel">
      <h2>Connection Status</h2>
      
      <div class="connection-status {counterStatus.isConnected ? 'connected' : 'disconnected'}">
        <div class="status-indicator"></div>
        <div class="status-text">
          {counterStatus.isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      
      <div class="server-info">
        <div class="info-item">
          <span class="info-label">Target Server:</span>
          <span class="info-value">{targetServer}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Last Check:</span>
          <span class="info-value">{formatTime(counterStatus.lastCheck)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Check Count:</span>
          <span class="info-value">{counterStatus.checkCount}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fail Count:</span>
          <span class="info-value">{counterStatus.failCount}</span>
        </div>
      </div>
      
      <div class="monitor-controls">
        <button on:click={startChecking} disabled={!!checkTimer}>
          Start Monitoring
        </button>
        <button on:click={stopChecking} disabled={!checkTimer}>
          Stop Monitoring
        </button>
        <button on:click={checkConnection}>
          Check Now
        </button>
      </div>
    </div>
    
    <!-- Counter data -->
    <div class="counter-panel">
      <h2>Counter Data</h2>
      
      {#if counterStatus.isConnected}
        <div class="counter-data">
          <div class="counter-item">
            <span class="counter-value">{counterStatus.peopleCount}</span>
            <span class="counter-label">Current People</span>
          </div>
          <div class="counter-stats">
            <div class="counter-stat">
              <span class="stat-value">{counterStatus.totalEntries}</span>
              <span class="stat-label">Total Entries</span>
            </div>
            <div class="counter-stat">
              <span class="stat-value">{counterStatus.totalExits}</span>
              <span class="stat-label">Total Exits</span>
            </div>
          </div>
        </div>
      {:else}
        <div class="no-data">
          Not connected to counter server
        </div>
      {/if}
    </div>
    
    <!-- Test tools -->
    <div class="test-panel">
      <h2>Connection Testing</h2>
      
      <div class="test-controls">
        <button on:click={sendTestData} class="test-button">
          Send Test Entry
        </button>
      </div>
      
      <div class="test-result">
        {testMessage}
      </div>
    </div>
    
    <!-- Log output -->
    <div class="log-panel">
      <div class="log-header">
        <h2>Debug Log</h2>
        <button on:click={clearLogs} class="clear-button">
          Clear
        </button>
      </div>
      
      <div class="log-container">
        {#if logs.length === 0}
          <div class="no-logs">No log entries</div>
        {:else}
          <ul class="log-list">
            {#each logs as log}
              <li class="log-entry">{log}</li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
    
    <div class="navigation">
      <a href="/" class="nav-link">← Back to Counter</a>
    </div>
  </div>
</main>

<style>
  /* Base styles */
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f0f2f5;
    color: #333;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  h1, h2 {
    color: #2c3e50;
  }
  
  h2 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .subtitle {
    color: #7f8c8d;
    margin-top: 0;
  }
  
  /* Panel styling */
  .status-panel, .counter-panel, .test-panel, .log-panel {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
  }
  
  /* Connection status styling */
  .connection-status {
    display: flex;
    align-items: center;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 4px;
  }
  
  .connection-status.connected {
    background-color: #d4edda;
    color: #155724;
  }
  
  .connection-status.disconnected {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 10px;
  }
  
  .connected .status-indicator {
    background-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
  }
  
  .disconnected .status-indicator {
    background-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
  }
  
  .status-text {
    font-weight: bold;
  }
  
  /* Server info styling */
  .server-info {
    margin-bottom: 15px;
  }
  
  .info-item {
    display: flex;
    margin-bottom: 5px;
  }
  
  .info-label {
    width: 120px;
    font-weight: 500;
    color: #7f8c8d;
  }
  
  /* Monitor controls */
  .monitor-controls {
    display: flex;
    gap: 10px;
  }
  
  button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  button:hover:not(:disabled) {
    background-color: #2980b9;
  }
  
  button:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
  
  /* Counter data styling */
  .counter-data {
    text-align: center;
  }
  
  .counter-item {
    margin-bottom: 20px;
  }
  
  .counter-value {
    font-size: 48px;
    font-weight: bold;
    color: #2980b9;
    display: block;
  }
  
  .counter-label {
    font-size: 16px;
    color: #7f8c8d;
  }
  
  .counter-stats {
    display: flex;
    justify-content: space-around;
  }
  
  .counter-stat {
    text-align: center;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    display: block;
  }
  
  .stat-label {
    font-size: 14px;
    color: #7f8c8d;
  }
  
  .no-data {
    padding: 30px;
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
  }
  
  /* Test panel styling */
  .test-controls {
    margin-bottom: 15px;
  }
  
  .test-button {
    background-color: #27ae60;
  }
  
  .test-button:hover:not(:disabled) {
    background-color: #219653;
  }
  
  .test-result {
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  /* Log panel styling */
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .clear-button {
    background-color: #e74c3c;
  }
  
  .clear-button:hover {
    background-color: #c0392b;
  }
  
  .log-container {
    background-color: #f8f9fa;
    border-radius: 4px;
    height: 200px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 12px;
  }
  
  .log-list {
    list-style: none;
    margin: 0;
    padding: 10px;
  }
  
  .log-entry {
    padding: 3px 0;
    border-bottom: 1px solid #eee;
  }
  
  .log-entry:last-child {
    border-bottom: none;
  }
  
  .no-logs {
    padding: 20px;
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
  }
  
  /* Navigation */
  .navigation {
    margin-top: 20px;
    text-align: center;
  }
  
  .nav-link {
    color: #3498db;
    text-decoration: none;
  }
  
  .nav-link:hover {
    text-decoration: underline;
  }
</style> 