<script lang="ts">
	import {
		apple_touch_icon,
		favicon_svg,
		favicon_sizes,
		webmanifest,
	} from 'virtual:o7-favicon';
</script>

<svelte:head>
	<link rel="favicon" sizes={favicon_sizes} href="/favicon.ico" />
	<link rel="manifest" href={webmanifest} />
	{#if apple_touch_icon}
		<link rel="apple-touch-icon" sizes="180x180" href={apple_touch_icon} />
	{/if}
	{#if favicon_svg}
		<link rel="icon" type="image/svg+xml" href={favicon_svg} />
	{/if}
</svelte:head>
