import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { phosphorSvelteOptimize } from 'phosphor-svelte/preprocessor'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [phosphorSvelteOptimize(), vitePreprocess()],

  kit: {
    adapter: adapter(),
  },
}

export default config
