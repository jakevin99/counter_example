<script lang="ts">
  // Import necessary Svelte functionality
  import { onMount, onDestroy } from 'svelte';
  
  // Define event history interface
  interface CounterEvent {
    type: 'entry' | 'exit';
    timestamp: string;
    deviceTimestamp: number;
    deviceId: string;
  }
  
  // State variables for counter data
  let peopleCount = 0;
  let totalEntries = 0;
  let totalExits = 0;
  let eventHistory: CounterEvent[] = [];
  let lastUpdated = new Date();
  let loading = true;
  
  // Function to fetch counter data from the API
  async function fetchCounterData() {
    try {
      const response = await fetch('/api/counters');
      const data = await response.json();
      
      // Update state with received data
      peopleCount = data.peopleCount;
      totalEntries = data.totalEntries;
      totalExits = data.totalExits;
      eventHistory = data.eventHistory;
      lastUpdated = new Date();
      loading = false;
    } catch (error) {
      console.error('Error fetching counter data:', error);
      loading = false;
    }
  }
  
  // Variable to store interval timer for auto-refresh
  let refreshInterval: ReturnType<typeof setInterval>;
  
  // Setup auto-refresh when component mounts
  onMount(() => {
    // Fetch data immediately
    fetchCounterData();
    
    // Then set up interval to refresh every 5 seconds
    refreshInterval = setInterval(fetchCounterData, 5000);
  });
  
  // Clean up interval when component unmounts
  onDestroy(() => {
    if (refreshInterval) clearInterval(refreshInterval);
  });
  
  // Format timestamp for display
  function formatTime(timestamp: string | Date): string {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString();
  }
</script>

<svelte:head>
  <title>ESP32 People Counter</title>
</svelte:head>

<main>
  <div class="container">
    <header>
      <h1>ESP32 People Counter</h1>
      <p class="subtitle">Real-time monitoring of entries and exits</p>
    </header>
    
    <!-- Current count display -->
    <div class="count-panel">
      <div class="count-display">
        <div class="count-value">{peopleCount}</div>
        <div class="count-label">Current People</div>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <span class="stat-value">{totalEntries}</span>
          <span class="stat-label">Total Entries</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{totalExits}</span>
          <span class="stat-label">Total Exits</span>
        </div>
      </div>
    </div>
    
    <!-- Recent events log -->
    <div class="events-panel">
      <h2>Recent Events</h2>
      {#if loading}
        <p class="loading">Loading data...</p>
      {:else if eventHistory.length === 0}
        <p class="no-events">No events recorded yet</p>
      {:else}
        <ul class="event-list">
          {#each eventHistory as event}
            <li class="event-item {event.type}">
              <span class="event-type">{event.type === 'entry' ? '➡️ Entry' : '⬅️ Exit'}</span>
              <span class="event-time">{formatTime(event.timestamp)}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    
    <div class="footer">
      <button on:click={fetchCounterData} class="refresh-btn">
        Refresh Data
      </button>
      <div class="last-update">
        Last updated: {formatTime(lastUpdated)}
      </div>
    </div>
    
    <div class="test-link">
      <div class="link-buttons">
        <a href="/test" class="test-page-link">Open Test Tool</a>
        <a href="/config" class="config-page-link">Configure Device</a>
        <a href="/debug" class="debug-page-link">Debug Connection</a>
      </div>
      <p class="test-description">Use the test tool to simulate counter events or configure device settings</p>
    </div>
  </div>
</main>

<style>
  /* Reset and base styles */
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
  
  h1 {
    color: #2c3e50;
    margin-bottom: 5px;
  }
  
  .subtitle {
    color: #7f8c8d;
    margin-top: 0;
  }
  
  /* Count display styling */
  .count-panel {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .count-display {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .count-value {
    font-size: 72px;
    font-weight: bold;
    color: #2980b9;
  }
  
  .count-label {
    font-size: 18px;
    color: #7f8c8d;
  }
  
  .stats {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
  
  .stat-item {
    text-align: center;
    padding: 0 20px;
  }
  
  .stat-value {
    display: block;
    font-size: 36px;
    font-weight: bold;
  }
  
  .stat-label {
    font-size: 14px;
    color: #7f8c8d;
  }
  
  /* Events panel styling */
  .events-panel {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 30px;
  }
  
  .events-panel h2 {
    margin-top: 0;
    color: #2c3e50;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  
  .event-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .event-item {
    padding: 12px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
  }
  
  .event-item:last-child {
    border-bottom: none;
  }
  
  .event-item.entry {
    border-left: 4px solid #2ecc71;
  }
  
  .event-item.exit {
    border-left: 4px solid #e74c3c;
  }
  
  .event-type {
    font-weight: 500;
  }
  
  .event-time {
    color: #7f8c8d;
  }
  
  .loading, .no-events {
    text-align: center;
    color: #7f8c8d;
    padding: 20px;
  }
  
  /* Footer styling */
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .refresh-btn {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  
  .refresh-btn:hover {
    background-color: #2980b9;
  }
  
  .last-update {
    font-size: 12px;
    color: #7f8c8d;
  }
  
  /* Test link styling */
  .test-link {
    margin-top: 20px;
    text-align: center;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }
  
  .link-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 10px;
  }
  
  .test-page-link {
    display: inline-block;
    background-color: #27ae60;
    color: white;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .test-page-link:hover {
    background-color: #219653;
  }
  
  .config-page-link {
    display: inline-block;
    background-color: #3498db;
    color: white;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .config-page-link:hover {
    background-color: #2980b9;
  }
  
  .debug-page-link {
    display: inline-block;
    background-color: #e67e22;
    color: white;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .debug-page-link:hover {
    background-color: #d35400;
  }
  
  .test-description {
    margin-top: 8px;
    margin-bottom: 0;
    font-size: 12px;
    color: #7f8c8d;
  }
</style>
