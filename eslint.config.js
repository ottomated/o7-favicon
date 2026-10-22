import js from '@eslint/js';
import { loadConfig } from '@sveltejs/load-config';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const svelte_config = await loadConfig('.');
if (!svelte_config || !('config' in svelte_config)) {
	throw new Error(`Failed to load Svelte config: ${svelte_config?.error}`);
}

export default defineConfig(
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: { 'no-undef': 'off' },
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig: svelte_config.config,
			},
		},
	},
	{
		ignores: ['**/.svelte-kit', '.wrangler/', 'build/', 'dist/'],
	},
);
