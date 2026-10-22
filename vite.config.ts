import { o7Favicon } from './src/lib/vite.ts';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
		}),
		o7Favicon({ path: './src/favicon.svg', webmanifest: { name: 'test' } }),
	],
});
