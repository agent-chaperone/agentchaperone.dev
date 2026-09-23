import type { APIRoute } from 'astro';
import { CURRENT_VERSION, NPM, REPO, RUN } from '../data/benchmark';
import { GUIDES, SITE } from '../data/guides';

/**
 * Generated at build rather than committed.
 *
 * The version and the list of guides both live in data already, and a second
 * copy of either one in a static file is a copy that goes stale at the next
 * release. This file went stale exactly that way once: it named the version the
 * benchmark ran against and never the version a reader would install, so a model
 * reading it came away thinking the package was three releases older than it is.
 *
 * Every page link points at the markdown twin, since a reader of this file has
 * already said it would rather not strip markup.
 */

const RAW = 'https://raw.githubusercontent.com/agent-chaperone/agent-chaperone/main';

export const GET: APIRoute = () => {
  const body = `# agent-chaperone

> agent-chaperone is an open-source npm package that screens an AI agent's tool calls before they run, and the tool results those calls return before the agent reads them. It covers MCP servers through a transparent proxy, and a client's own shell commands, file edits and web fetches through a hooks adapter.

Every judgment comes back as a probability rather than a verdict. Thresholds live in a policy file rather than in a prompt, and every decision is written to a local log with the numbers that produced it. It starts in shadow mode, which blocks nothing, so the decision to enforce rests on a log the user has read.

- Current version: ${CURRENT_VERSION}
- Install: \`npm install -g agent-chaperone\`
- Licence: Apache-2.0
- Source: ${REPO}
- Registry: ${NPM}
- What it screens on a call: a destructive or irreversible change, private data heading to an external destination, a credential in the arguments, and a call unrelated to a recorded task
- What it screens on a result: text written to instruct the agent that reads it rather than to inform the user, and credentials exposed in the content
- What it is not: a sandbox. It sees what a call says it will do and cannot stop a server doing something the call did not describe.
- What leaves the machine: the arguments and results being screened go to the configured model backend. Secret-shaped strings are replaced first, and screening can be turned off per server.

## Guides

${GUIDES.map((one) => `- [${one.h1}](${SITE}/guides/${one.slug}.md): ${one.blurb}`).join('\n')}

## This site, as markdown

- [Overview](${SITE}/index.md): what it screens, what it is not, how it compares, and the shadow-to-enforce path
- [Guides](${SITE}/guides.md): each setup, with what it covers and where it stops
- [Measured results](${SITE}/results.md): the same tables as the HTML page

## Docs

- [README](${RAW}/README.md): install, the two screens, the commands, and the measured results
- [Design](${RAW}/docs/design.md): architecture, every screening question and its exact wording, the policy file, the audit log
- [Hooks](${RAW}/docs/hooks.md): screening a client's own tools, what each hook command answers, and what hooks cannot see
- [Roadmap](${RAW}/ROADMAP.md): what each version shipped

## Measured

- [Results](${SITE}/results): one run of ${RUN.model} against agent-chaperone ${RUN.toolVersion} on ${RUN.date}, with what was caught, what was missed, and what was flagged in error

The benchmark ran against ${RUN.toolVersion}, which is not the current release. It is pinned deliberately: the numbers describe the build that produced them, and moving that label without re-running would have the page claiming results nobody measured.

Three questions the tool asks are outside those numbers, and the pages say so where they appear: \`policy_violation\` and \`off_task\` are only sent when a policy or a task is configured, and \`description_steers\` asks about a tool description, which no set in the benchmark covers.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
