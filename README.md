# agentchaperone.dev

The website for [agent-chaperone](https://github.com/agent-chaperone/agent-chaperone), a calibrated firewall for AI agent tool calls.

Two pages. The front page carries the positioning and a counts table, and `/results` carries the full measured picture. Everything else links into the tool's own repository, because a copy of the docs here would be a second source of truth that drifts, and drift in a security tool's documentation is worse than a click.

## Running it

```bash
pnpm install
pnpm dev
```

`pnpm build` writes `dist/`, `pnpm typecheck` runs `astro check`, and `pnpm lint` and `pnpm format:check` are the same checks CI runs.

## How this is built

Astro in static mode, hand-written CSS, no framework and no client JavaScript at all. The last part is not a preference. The site sends `script-src 'none'` in its Content-Security-Policy, and CI fails the build if a script ever reaches `dist/`, so the header keeps meaning what it says.

There is no analytics of any kind, and therefore no cookie banner. A tool whose pitch is knowing what leaves your machine should not have a site that quietly reports on the people reading about it.

## The numbers

Every measured figure on the site comes from `src/data/benchmark.ts`, transcribed from one scorer run in the tool repository. Both pages read from that one file so they cannot disagree with each other, and nothing on the site computes a metric from raw rows: two published numbers for one run is a worse outcome than one table.

When the benchmark is re-measured, update that file and the run metadata at the top of it in the same change.

## Rules this site holds itself to

- Never say it blocks or prevents prompt injection. It screens, flags, holds, withholds and annotates.
- Never show an accuracy figure without its miss count beside it.
- Never put the word "default" next to a benchmark number unless that number really is the shipped threshold, which differs between the call screen and the result screen.
- No comparison to any other tool.

## Regenerating the social card

```bash
python3 scripts/make-og.py
```

It carries no measured numbers on purpose. Social scrapers cache aggressively, and a stale figure in a cached card cannot be fixed by redeploying.

## License

Apache-2.0. See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).
