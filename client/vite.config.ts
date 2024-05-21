import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import envCompatible from 'vite-plugin-env-compatible'

export default defineConfig({
	envPrefix: 'REACT_',
	server: {
    host: '0.0.0.0'
  },
	plugins: [
		react(),
		envCompatible(),
		VitePWA({
			registerType: 'prompt',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
			manifest: {
				name: 'Tic Tac Toe Ultimate',
				short_name: 'Tic Tac Toe',
				theme_color: '#FFFFFF',
				background_color: '#000000',
				scope: '/',
				start_url: '/',
				orientation: 'portrait',
				display: 'standalone',
				icons: [
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'favicon',
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'favicon',
					},
					{
						src: '/apple-touch-icon.png',
						sizes: '180x180',
						type: 'image/png',
						purpose: 'apple touch icon',
					},
					{
						src: '/maskable_icon.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
