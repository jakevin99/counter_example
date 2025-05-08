// src/routes/api/config/+server.ts
// This file provides an API endpoint to get and update configuration settings

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Define interfaces for type safety
interface ServerSettings {
  serverUrl: string;
  deviceName: string;
  updateInterval: number;
}

interface UpdateSettingsRequest {
  serverUrl?: string;
  deviceName?: string;
  updateInterval?: number;
}

// Use the known server IP address from the issue description
const serverIp = '192.168.43.44';

// In-memory storage for configuration settings
// In a production app, these would come from a database or environment variables
let serverSettings: ServerSettings = {
  serverUrl: `http://${serverIp}:3000/api/counters`,
  deviceName: 'ESP_CounterDevice',
  updateInterval: 5000  // milliseconds
};

// GET endpoint to retrieve current server settings
export const GET: RequestHandler = () => {
  return json({
    success: true,
    settings: {
      ...serverSettings,
      // Add server's actual IP/hostname for easier configuration
      currentServerIp: serverIp
    }
  });
}

// POST endpoint to update server settings
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse the incoming JSON data
    const data = await request.json() as UpdateSettingsRequest;
    
    // Update settings with provided values
    if (data.serverUrl) {
      serverSettings.serverUrl = data.serverUrl;
    }
    
    if (data.deviceName) {
      serverSettings.deviceName = data.deviceName;
    }
    
    if (data.updateInterval) {
      serverSettings.updateInterval = Number(data.updateInterval);
    }
    
    // Return updated settings
    return json({ 
      success: true, 
      message: 'Settings updated successfully',
      settings: serverSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    
    // Return error response
    return json({ 
      success: false, 
      message: 'Error updating settings' 
    }, { status: 400 });
  }
} 