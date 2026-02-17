import { o7Favicon } from './src/lib/vite.ts';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import PluginInspect from 'vite-plugin-inspect';

export default defineConfig({
	plugins: [
		sveltekit(),
		o7Favicon({ path: './favicon1.png', webmanifest: { name: 'test' } }),
		PluginInspect(),
	],
});
