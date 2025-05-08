<script lang="ts">
  // Import necessary Svelte functionality
  import { onMount } from 'svelte';
  
  // Interface for server settings
  interface ServerSettings {
    serverUrl: string;
    deviceName: string;
    updateInterval: number;
    currentServerIp?: string;
  }
  
  // State variables
  let settings: ServerSettings = {
    serverUrl: '',
    deviceName: '',
    updateInterval: 5000
  };
  let loading = true;
  let saving = false;
  let message = '';
  let messageType = '';
  
  // Fetch current settings on page load
  onMount(async () => {
    await fetchSettings();
  });
  
  // Function to fetch settings from the API
  async function fetchSettings() {
    try {
      loading = true;
      const response = await fetch('/api/config');
      const data = await response.json();
      
      if (data.success) {
        settings = data.settings;
      } else {
        showMessage('Failed to load settings', 'error');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showMessage('Failed to load settings', 'error');
    } finally {
      loading = false;
    }
  }
  
  // Function to save settings
  async function saveSettings() {
    try {
      saving = true;
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('Settings saved successfully', 'success');
      } else {
        showMessage('Failed to save settings: ' + data.message, 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('Error saving settings', 'error');
    } finally {
      saving = false;
    }
  }
  
  // Helper to show status messages
  function showMessage(text: string, type: 'success' | 'error') {
    message = text;
    messageType = type;
    
    // Clear message after 5 seconds
    setTimeout(() => {
      message = '';
      messageType = '';
    }, 5000);
  }
  
  // Reset form to default values
  function resetForm() {
    fetchSettings();
  }
</script>

<svelte:head>
  <title>ESP32 Counter - Configuration</title>
</svelte:head>

<main>
  <div class="container">
    <header>
      <h1>ESP32 Counter Configuration</h1>
      <p class="subtitle">Manage device connection settings</p>
    </header>
    
    <div class="config-panel">
      <h2>Device Settings</h2>
      
      <!-- Display loading indicator when loading settings -->
      {#if loading}
        <div class="loading">Loading settings...</div>
      {:else}
        <form on:submit|preventDefault={saveSettings} class="config-form">
          <div class="form-group">
            <label for="serverUrl">Server URL</label>
            <input 
              type="text" 
              id="serverUrl" 
              bind:value={settings.serverUrl} 
              disabled={saving}
              placeholder="http://your-server-address:3000/api/counters"
            />
            <p class="help-text">
              The full URL where the ESP32 device will send counter data.
              {#if settings.currentServerIp}
                <br>Current server: <code>{settings.currentServerIp}</code>
              {/if}
            </p>
          </div>
          
          <div class="form-group">
            <label for="deviceName">Device Name</label>
            <input 
              type="text" 
              id="deviceName" 
              bind:value={settings.deviceName} 
              disabled={saving}
            />
            <p class="help-text">Identifier for the ESP32 device</p>
          </div>
          
          <div class="form-group">
            <label for="updateInterval">Update Interval (ms)</label>
            <input 
              type="number" 
              id="updateInterval" 
              bind:value={settings.updateInterval} 
              min="1000" 
              max="60000" 
              step="1000" 
              disabled={saving}
            />
            <p class="help-text">How often the device should report counts (in milliseconds)</p>
          </div>
          
          <!-- Status message display area -->
          {#if message}
            <div class="message {messageType}">
              {message}
            </div>
          {/if}
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="save-btn" 
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            
            <button 
              type="button" 
              class="reset-btn" 
              on:click={resetForm} 
              disabled={saving}
            >
              Reset
            </button>
          </div>
        </form>
        
        <div class="configuration-help">
          <h3>Configuration Instructions</h3>
          <p>
            To configure your ESP32 People Counter device:
          </p>
          <ol>
            <li>Enter the complete URL where your device should send counter data</li>
            <li>Set your desired device name for identification</li>
            <li>Adjust how frequently the counter reports data</li>
            <li>Save your settings</li>
            <li>Update your ESP32 device with these new settings</li>
          </ol>
          
          <div class="device-code">
            <h4>ESP32 Configuration Code</h4>
            <p>Use the following code in your ESP32 setup to update the server URL:</p>
            <pre><code>
preferences.begin("counter", false);
preferences.putString("serverUrl", "{settings.serverUrl}");
preferences.end();
            </code></pre>
          </div>
        </div>
      {/if}
    </div>
    
    <div class="navigation-links">
      <a href="/" class="nav-link">← Counter Display</a>
      <a href="/test" class="nav-link">Test Tool →</a>
    </div>
  </div>
</main>

<style>
  /* Base styling */
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
  
  h2 {
    margin-top: 0;
    color: #2c3e50;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  
  /* Config panel styling */
  .config-panel {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 30px;
  }
  
  .loading {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
  }
  
  /* Form styling */
  .config-form {
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
  }
  
  .form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }
  
  .help-text {
    margin-top: 6px;
    font-size: 12px;
    color: #7f8c8d;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  
  .save-btn {
    flex: 2;
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  
  .save-btn:hover:not(:disabled) {
    background-color: #2980b9;
  }
  
  .save-btn:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
  
  .reset-btn {
    flex: 1;
    background-color: #ecf0f1;
    border: 1px solid #bdc3c7;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  
  .reset-btn:hover:not(:disabled) {
    background-color: #bdc3c7;
  }
  
  /* Message styling */
  .message {
    padding: 12px;
    margin: 15px 0;
    border-radius: 4px;
    text-align: center;
  }
  
  .message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  /* Configuration help styling */
  .configuration-help {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .configuration-help h3 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
  }
  
  .configuration-help ol {
    padding-left: 20px;
  }
  
  .configuration-help li {
    margin-bottom: 8px;
  }
  
  .device-code {
    margin-top: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #3498db;
  }
  
  .device-code h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #2c3e50;
    font-size: 16px;
  }
  
  .device-code pre {
    margin: 0;
    overflow-x: auto;
    padding: 10px;
    background-color: #f1f1f1;
    border-radius: 4px;
  }
  
  .device-code code {
    font-family: Consolas, Monaco, 'Andale Mono', monospace;
    font-size: 14px;
    color: #2c3e50;
  }
  
  /* Navigation links */
  .navigation-links {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
  
  .nav-link {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
  }
  
  .nav-link:hover {
    text-decoration: underline;
  }
</style> 