import { readFile, stat } from 'node:fs/promises';
import type { Plugin } from 'vite';
import sharp from 'sharp';
import ico from 'ico-endec';
import type { ImageResource, WebAppManifest } from 'web-app-manifest';
import * as path from 'node:path';
import { optimize } from 'svgo';

const module_id = 'virtual:o7-favicon';
const dev_server_prefix = '/@o7/favicon-DEV/';

type Options = {
	/** The path to the source favicon image. Ideally at least 512x512 pixels. This will be resolved relative to the current working directory. */
	path: string;
	/** The contents of the `site.webmanifest` file. Android icons will be automatically added if not provided. */
	webmanifest?: WebAppManifest;
};

export function o7Favicon(options: Options): Plugin {
	let is_build: boolean;
	let webmanifest_asset_id: string | undefined;
	let ico_buffer: Buffer | undefined;

	const dev_files = new Map<
		string,
		{ buffer: Buffer | string; mime_type: string }
	>();
	function add_dev_file(
		name: string,
		mime_type: string,
		buffer: Buffer | string,
	) {
		const url = `${dev_server_prefix}${name}`;
		dev_files.set(url, { buffer, mime_type });
		return url;
	}

	return {
		name: 'o7-favicon',
		config(_, env) {
			is_build = env.command === 'build';
			return {
				optimizeDeps: {
					exclude: [module_id],
				},
			};
		},
		configureServer(server) {
			// Serve favicon.ico in dev mode
			server.middlewares.use((req, res, next) => {
				if (req.url === '/favicon.ico' && ico_buffer) {
					res.setHeader('Content-Type', 'image/x-icon');
					res.end(ico_buffer);
					return;
				}
				if (req.url?.startsWith(dev_server_prefix)) {
					const file = dev_files.get(req.url);
					if (file) {
						res.setHeader('Content-Type', file.mime_type);
						res.end(file.buffer);
						return;
					}
				}
				next();
			});
		},
		resolveId(id) {
			if (id === module_id) {
				return '\0' + module_id;
			}
		},
		async load(id) {
			if (id !== '\0' + module_id) {
				return null;
			}

			if (!options.path) {
				this.error(
					`Missing "path" - should point to the source favicon image.`,
				);
			}
			const source_exists = await stat(options.path).catch(() => false);
			if (!source_exists) {
				this.error(`"${options.path}" does not exist.`);
			}
			const source_img = sharp(options.path, { density: 512 /* for svgs */ });

			let svg_asset: string | null = null;
			if (options.path.endsWith('.svg')) {
				const optimized = optimize(await readFile(options.path, 'utf8'), {
					path: options.path,
					multipass: true,
				}).data;
				if (is_build) {
					svg_asset = `__VITE_ASSET__${this.emitFile({
						type: 'asset',
						name: 'favicon.svg',
						source: optimized,
					})}__`;
				} else {
					return add_dev_file('favicon.svg', 'image/svg+xml', optimized);
				}
			}

			const meta = await source_img.metadata();
			if (meta.width !== meta.height) {
				this.error(
					`"${options.path}" must be a square image (is ${meta.width}x${meta.height})`,
				);
			}
			if (meta.width < 32) {
				this.error(`"${options.path}" must be at least 32x32 pixels.`);
			}
			const failures: Array<[size: number, name: string]> = [];
			const make_png_asset = async (name: string, size: number) => {
				if (meta.width < size) {
					failures.push([size, name + '.png']);
					return null;
				}
				const buffer = await source_img.clone().resize(size).png().toBuffer();
				if (is_build) {
					return `__VITE_ASSET__${this.emitFile({
						type: 'asset',
						name: name + '.png',
						source: buffer,
					})}__`;
				} else {
					return add_dev_file(name + '.png', 'image/png', buffer);
				}
			};

			//#region favicon.ico
			const ico_parts: Array<Buffer> = [];
			const ico_sizes: Array<string> = [];
			for (const size of [16, 32, 48]) {
				if (meta.width < size) {
					failures.push([size, `favicon.ico (size ${size})`]);
					continue;
				}
				ico_sizes.push(`${size}x${size}`);
				ico_parts.push(await source_img.clone().resize(size).png().toBuffer());
			}

			ico_buffer = ico.encode(ico_parts);
			if (is_build) {
				this.emitFile({
					type: 'asset',
					fileName: 'favicon.ico',
					source: ico_buffer,
				});
			}
			//#endregion

			//#region site.webmanifest
			const webmanifest_icons: Array<ImageResource> = [];
			for (const size of [192, 512]) {
				const exists = options.webmanifest?.icons?.some(
					(i) => i.sizes === `${size}x${size}` && i.type === 'image/png',
				);
				if (exists) continue;
				const asset_id = await make_png_asset(`android-${size}`, size);
				if (!asset_id) continue;
				webmanifest_icons.push({
					src: asset_id,
					sizes: `${size}x${size}`,
					type: 'image/png',
				});
			}
			if (
				svg_asset &&
				!options.webmanifest?.icons?.some((i) => i.type === 'image/svg+xml')
			) {
				webmanifest_icons.push({
					src: svg_asset,
					sizes: 'any',
					type: 'image/svg+xml',
				});
			}
			options.webmanifest ??= {};
			if (webmanifest_icons.length) {
				options.webmanifest.icons ??= [];
				options.webmanifest.icons.push(...webmanifest_icons);
			}
			let webmanifest_export: string;
			if (is_build) {
				webmanifest_asset_id = this.emitFile({
					type: 'asset',
					name: 'site.webmanifest',
					source: JSON.stringify(options.webmanifest),
				});
				webmanifest_export = `"__VITE_ASSET__${webmanifest_asset_id}__"`;
			} else {
				webmanifest_export = JSON.stringify(
					add_dev_file(
						'site.webmanifest',
						'application/manifest+json',
						JSON.stringify(options.webmanifest),
					),
				);
			}

			//#endregion

			const module = `
				export const apple_touch_icon = ${JSON.stringify(await make_png_asset('apple-touch-icon', 180))};
				export const webmanifest = ${webmanifest_export};
				export const favicon_sizes = ${JSON.stringify(ico_sizes.join(' '))};
				export const favicon_svg = ${JSON.stringify(svg_asset)};
			`;
			if (failures.length) {
				this.warn(
					`Failed to generate ${failures.length} favicon${failures.length === 1 ? '' : 's'}. Please provide a larger input image (currently ${meta.width}x${meta.height}):`,
				);
				for (const [size, name] of failures) {
					this.warn(`  ${name} (required size ${size}x${size})`);
				}
			}

			return module;
		},
		generateBundle(_, bundle) {
			if (!webmanifest_asset_id) return;
			const webmanifest_asset = bundle[this.getFileName(webmanifest_asset_id)];
			if (
				!webmanifest_asset ||
				webmanifest_asset.type !== 'asset' ||
				typeof webmanifest_asset.source !== 'string'
			) {
				this.error('Failed to find generated webmanifest asset.');
				return;
			}
			const manifest = JSON.parse(webmanifest_asset.source);
			for (const icon of manifest.icons ?? []) {
				const asset_id = /^__VITE_ASSET__(.*)__$/.exec(icon.src)?.[1];
				if (!asset_id) continue;
				const icon_asset = bundle[this.getFileName(asset_id)];

				const relative_path = path
					.relative(
						path.dirname(webmanifest_asset.fileName),
						path.dirname(icon_asset.fileName),
					)
					.replace(/\\/g, '/');
				const filename = path.basename(icon_asset.fileName);

				if (!relative_path) {
					icon.src = `./${filename}`;
				} else if (relative_path.startsWith('..')) {
					icon.src = `${relative_path}/${filename}`;
				} else {
					icon.src = `./${relative_path}/${filename}`;
				}
			}
			webmanifest_asset.source = JSON.stringify(manifest);
		},
	};
}
