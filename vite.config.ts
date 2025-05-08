import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// Add proxy to redirect requests from port 3000 to the actual server
		proxy: {
			// Match requests to /api/counters
			'/api/counters': {
				target: 'http://localhost:5174',
				changeOrigin: true
			},
			// Match requests to /api/config
			'/api/config': {
				target: 'http://localhost:5174',
				changeOrigin: true
			}
		},
		// Make the server accessible from other devices in the network
		host: '0.0.0.0',
		port: 3000
	}
});
