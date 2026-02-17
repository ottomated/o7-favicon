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
    o7Favicon({
      // Can use any image that `sharp` accepts. Ideally .svg!
      path: './favicon.png',
      webmanifest: { name: 'Name' }
    }),
  ],
});

```

## Changelog

### 0.0.3

- Fix dependency pre-bundling

### 0.0.1

- Initial release
