declare module 'ico-endec' {
	export function encode(images: Array<Buffer | ArrayBuffer>): Buffer;
}

declare module 'virtual:o7-favicon' {
	export const apple_touch_icon: string | null;
	export const favicon_svg: string | null;
	export const favicon_sizes: string;
	export const webmanifest: string;
}
