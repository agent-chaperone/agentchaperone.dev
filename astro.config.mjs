import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { RUN } from './src/data/benchmark';

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
  integrations: [
    sitemap({
      // A date a crawler can read. Every page here is prose about a released
      // version, so the date that matters is the release the page describes,
      // not the moment the build ran: a rebuild with no content change should
      // not claim the page is newer than it is.
      lastmod: new Date(RUN.date),
      serialize: (page) => ({
        ...page,
        // The landing page is the one worth crawling most often, and the only
        // one that changes when anything about the tool does.
        changefreq: 'weekly',
        priority: page.url === 'https://agentchaperone.dev/' ? 1.0 : 0.8,
      }),
    }),
  ],
  // The reference documents are markdown copied from the repository. Syntax
  // highlighting would colour their code with inline style attributes, which
  // style-src 'self' refuses, so code renders plain here as it does on every
  // other page.
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },
});
