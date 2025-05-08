<script lang="ts">
  // State for the form inputs
  let deviceId = "ESP_CounterDevice";
  let entries = 0;
  let exits = 0;
  let sendingData = false;
  let responseMessage = "";
  let responseStatus = "";
  
  // Function to handle form submission and send test data
  async function sendTestData() {
    // Reset message and set loading state
    responseMessage = "";
    responseStatus = "";
    sendingData = true;
    
    try {
      // Prepare payload - same format expected by the ESP32 device
      const payload = {
        deviceId: deviceId,
        entries: Number(entries),
        exits: Number(exits),
        timestamp: Date.now() // Current timestamp in milliseconds
      };
      
      // Send POST request to the counter API
      const response = await fetch('/api/counters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // Parse response
      const data = await response.json();
      
      // Update status message based on response
      if (response.ok) {
        responseStatus = "success";
        responseMessage = "Data sent successfully! Current count: " + 
          data.currentCounts.peopleCount;
      } else {
        responseStatus = "error";
        responseMessage = "Error: " + data.message;
      }
    } catch (error: unknown) {
      responseStatus = "error";
      responseMessage = "Error sending data: " + (error instanceof Error ? error.message : String(error));
    } finally {
      sendingData = false;
    }
  }
  
  // Reset the form after submission
  function resetForm() {
    entries = 0;
    exits = 0;
  }
</script>

<svelte:head>
  <title>ESP32 Counter Simulator</title>
</svelte:head>

<main>
  <div class="container">
    <header>
      <h1>ESP32 Counter Test Tool</h1>
      <p class="subtitle">Simulate counter device data transmission</p>
    </header>
    
    <div class="test-panel">
      <h2>Send Test Counter Data</h2>
      <p class="instruction">
        Use this form to simulate the ESP32 device sending entry/exit data.
        This will update the counter display on the main page.
      </p>
      
      <form on:submit|preventDefault={sendTestData} class="test-form">
        <div class="form-group">
          <label for="deviceId">Device ID:</label>
          <input 
            type="text" 
            id="deviceId" 
            bind:value={deviceId} 
            disabled={sendingData} 
          />
        </div>
        
        <div class="form-group">
          <label>Event Type:</label>
          <div class="counter-inputs">
            <div class="counter-input">
              <label for="entries">Entries:</label>
              <div class="number-input">
                <button 
                  type="button" 
                  on:click={() => entries = 1} 
                  disabled={sendingData || entries === 1}
                  class={entries === 1 ? 'active' : ''}
                >
                  1
                </button>
                <button 
                  type="button" 
                  on:click={() => entries = 0} 
                  disabled={sendingData || entries === 0}
                  class={entries === 0 ? 'active' : ''}
                >
                  0
                </button>
              </div>
            </div>
            
            <div class="counter-input">
              <label for="exits">Exits:</label>
              <div class="number-input">
                <button 
                  type="button" 
                  on:click={() => exits = 1} 
                  disabled={sendingData || exits === 1}
                  class={exits === 1 ? 'active' : ''}
                >
                  1
                </button>
                <button 
                  type="button" 
                  on:click={() => exits = 0} 
                  disabled={sendingData || exits === 0}
                  class={exits === 0 ? 'active' : ''}
                >
                  0
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Event description based on selection -->
        <div class="event-description">
          {#if entries === 1 && exits === 0}
            <span class="entry-event">➡️ Person entering</span>
          {:else if entries === 0 && exits === 1}
            <span class="exit-event">⬅️ Person exiting</span>
          {:else if entries === 0 && exits === 0}
            <span class="neutral-event">No event selected</span>
          {:else}
            <span class="error-event">⚠️ Invalid combination (can't have both)</span>
          {/if}
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="send-btn" 
            disabled={sendingData || (entries === 0 && exits === 0) || (entries === 1 && exits === 1)}
          >
            {sendingData ? 'Sending...' : 'Send Data'}
          </button>
          
          <button 
            type="button" 
            class="reset-btn" 
            on:click={resetForm} 
            disabled={sendingData}
          >
            Reset
          </button>
        </div>
      </form>
      
      {#if responseMessage}
        <div class="response-message {responseStatus}">
          {responseMessage}
        </div>
      {/if}
      
      <div class="help-text">
        <h3>How to use this simulator:</h3>
        <ol>
          <li>Select either "Entry" (1) or "Exit" (0) - cannot be both</li>
          <li>Click "Send Data" to simulate the device sending this event</li>
          <li>View the results on the <a href="/">main counter page</a></li>
        </ol>
        
        <p><strong>Note:</strong> The ESP32 device is programmed to only send one entry 
        or exit at a time, which is why this simulator only allows 0 or 1 for each value.</p>
      </div>
    </div>
    
    <div class="footer">
      <a href="/" class="back-link">← Back to Counter Display</a>
    </div>
  </div>
</main>

<style>
  /* Base styling (reusing some styles from the main page) */
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
  
  /* Test panel styling */
  .test-panel {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 30px;
  }
  
  .instruction {
    color: #7f8c8d;
    margin-bottom: 20px;
  }
  
  /* Form styling */
  .test-form {
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
  }
  
  .form-group input[type="text"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .counter-inputs {
    display: flex;
    gap: 20px;
  }
  
  .counter-input {
    flex: 1;
  }
  
  .number-input {
    display: flex;
    gap: 5px;
  }
  
  .number-input button {
    flex: 1;
    padding: 10px;
    background-color: #f1f1f1;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
  }
  
  .number-input button:hover:not(:disabled) {
    background-color: #e1e1e1;
  }
  
  .number-input button.active {
    background-color: #3498db;
    color: white;
    border-color: #2980b9;
  }
  
  .number-input button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .event-description {
    padding: 10px;
    margin-bottom: 16px;
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
  }
  
  .entry-event {
    color: #27ae60;
  }
  
  .exit-event {
    color: #e74c3c;
  }
  
  .error-event {
    color: #e67e22;
  }
  
  .neutral-event {
    color: #7f8c8d;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
  }
  
  .send-btn {
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
  
  .send-btn:hover:not(:disabled) {
    background-color: #2980b9;
  }
  
  .send-btn:disabled {
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
  
  .response-message {
    margin-top: 20px;
    padding: 12px;
    border-radius: 4px;
    text-align: center;
  }
  
  .response-message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .response-message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  /* Help text styling */
  .help-text {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .help-text h3 {
    margin-top: 0;
    font-size: 16px;
    color: #2c3e50;
  }
  
  .help-text ol {
    padding-left: 20px;
  }
  
  .help-text li {
    margin-bottom: 8px;
  }
  
  /* Footer styling */
  .footer {
    margin-top: 20px;
    text-align: center;
  }
  
  .back-link {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
  }
  
  .back-link:hover {
    text-decoration: underline;
  }
</style> 