// src/routes/api/counters/+server.ts
// This file implements an API endpoint to receive counter data from the ESP32 device
// and store it in server memory (for simplicity)

// Import required SvelteKit modules
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Define interfaces for type safety
interface CounterEvent {
    type: 'entry' | 'exit';
    timestamp: Date;
    deviceTimestamp: number;
    deviceId: string;
}

interface CounterData {
    deviceId: string;
    entries: number;
    exits: number;
    timestamp: number;
}

// In-memory storage for counter data and history
// In a production app, you would use a database instead
let totalEntries = 0;
let totalExits = 0;
let peopleCount = 0; // current count (entries - exits)
let eventHistory: CounterEvent[] = []; // Store event history with timestamps

// POST endpoint to receive counter data from the ESP32
export const POST: RequestHandler = async ({ request }) => {
    try {
        // Parse the incoming JSON data
        const data = await request.json() as CounterData;
        
        // Extract data from the request
        const { deviceId, entries, exits, timestamp } = data;
        
        // Update counters
        if (entries > 0) {
            totalEntries += entries;
            peopleCount += entries;
            
            // Add to history
            eventHistory.push({
                type: 'entry',
                timestamp: new Date(),
                deviceTimestamp: timestamp,
                deviceId
            });
        }
        
        if (exits > 0) {
            totalExits += exits;
            peopleCount -= exits;
            
            // Add to history
            eventHistory.push({
                type: 'exit',
                timestamp: new Date(),
                deviceTimestamp: timestamp,
                deviceId
            });
        }
        
        // Keep history limited to most recent 100 events
        if (eventHistory.length > 100) {
            eventHistory = eventHistory.slice(-100);
        }
        
        // Return success response with updated counts
        return json({ 
            success: true, 
            message: 'Counter data received',
            currentCounts: {
                entries: totalEntries,
                exits: totalExits,
                peopleCount
            }
        });
    } catch (error) {
        console.error('Error processing counter data:', error);
        
        // Return error response
        return json({ 
            success: false, 
            message: 'Error processing data' 
        }, { status: 400 });
    }
}

// GET endpoint to retrieve the current counter data
export const GET: RequestHandler = () => {
    return json({
        totalEntries,
        totalExits,
        peopleCount,
        eventHistory: eventHistory.slice(-10) // Return only last 10 events for simplicity
    });
} 