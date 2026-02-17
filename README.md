<p align="center">
  <img src="https://i.postimg.cc/T1Wk3khh/logo.png" width="112" alt="o7 Logo" />
</p>

<h1 align="center">@o7/favicon</h1>

<p align="center">Automatically generate favicons and webmanifest.</p>
<br />

## Basic Usage

<!-- prettier-ignore -->
```svelte
<!-- /+layout.svelte -->
<script>
  import Favicon from '@o7/favicon'

  const { children } = $props();
</script>

<Favicon />
{@render children()}
```

<!-- prettier-ignore -->
```ts
// vite.config.ts
import { o7Favicon } from '@o7/favicon/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    o7Favicon({ path: './favicon.png', webmanifest: { name: 'Name' } }),
  ],
});

```

## Included Icon Packs:

- [Lucide](https://lucide.dev) (`@o7/icon/lucide`)
- [Heroicons](https://heroicons.com) (`@o7/icon/heroicons`, `@o7/icon/heroicons/solid`)
- [Material Design](https://fonts.google.com/icons) (`@o7/icon/material`, `@o7/icon/material/solid`)
- [Remix Icon](https://remixicon.com) (`@o7/icon/remix`, `@o7/icon/remix/solid`)

## Changelog

(icons are automatically updated daily as the source repos are updated)

### 0.3.5

- Fix regression that broke previews on hover

### 0.3.0

- Fix heroicons/outline
- Add Vite plugin

### 0.2.0

- Slightly shrink install size
- Fix icons not working when unmounted and remounted

### 0.0.13

- Add RemixIcon

### 0.0.6

- Add material icons
