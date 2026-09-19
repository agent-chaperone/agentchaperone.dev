import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output and no adapter. Every page here is prose, one diagram and two
// tables, so nothing needs a server at request time and nothing needs to hydrate.
// That is what lets the site send `script-src 'none'`, which is a claim worth
// being able to make on a tool whose pitch is knowing what leaves your machine.
export default defineConfig({
  site: 'https://agentchaperone.dev',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    // An external stylesheet rather than an inline <style>, so the CSP can say
    // style-src 'self' instead of 'unsafe-inline'. One request buys a header
    // that means what it says.
    inlineStylesheets: 'never',
  },
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
