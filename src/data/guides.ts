/**
 * The guides, listed once.
 *
 * The index page, the structured data, the sitemap and llms.txt all need the
 * same four facts about each guide, and a list that lives in four places drifts
 * within a release. A page still owns its own body; this owns what something
 * outside the page has to know about it.
 */

export interface Guide {
  /** The path under /guides, which is also the file name under src/pages/guides. */
  readonly slug: string;
  /** The heading, which is the sentence the page is answering. */
  readonly h1: string;
  /** The tab title. Carries the project name, because a citation carries this string. */
  readonly title: string;
  /** The meta description, and the summary a machine reader gets. */
  readonly description: string;
  /** One line for the index and for llms.txt, written to be read out of context. */
  readonly blurb: string;
}

export const GUIDES: readonly Guide[] = [
  {
    slug: 'mcp-security',
    h1: 'Screen MCP tool calls before they run',
    title: 'Screen MCP tool calls before they run | agent-chaperone',
    description:
      'Put an MCP server behind a screening proxy with one change to a client configuration. What each screen asks, how to run it in shadow mode first, and what a proxy cannot see.',
    blurb:
      'One change to a client configuration puts a server behind the screen. What crosses the proxy, what the pre-call and post-result screens ask, and where a proxy stops seeing anything.',
  },
  {
    slug: 'prompt-injection',
    h1: 'Screen tool results for prompt injection before the agent reads them',
    title: 'Screen tool results for prompt injection | agent-chaperone',
    description:
      'A tool result is attacker-controlled text that an agent reads as input. How the post-result screen finds hidden instructions, when it annotates rather than withholds, and what it misses.',
    blurb:
      'A fetched page, a file and an API response are all text somebody else wrote, and the agent reads them as input. What the screen catches, and the measured count of what it does not.',
  },
  {
    slug: 'claude-code',
    h1: "Screen Claude Code's built-in tools",
    title: "Screen Claude Code's built-in tools | agent-chaperone",
    description:
      'Claude Code runs shell commands, file edits and web fetches outside MCP, where a proxy never sees them. The hook configuration that closes that gap, and what hooks cannot see.',
    blurb:
      'A proxy sees MCP traffic and nothing else. Three hooks put the same screens in front of the shell, the file edits and the fetches a client runs itself.',
  },
  {
    slug: 'secret-exfiltration',
    h1: 'Catch secret-leaking tool calls before they run',
    title: 'Catch secret-leaking tool calls before they run | agent-chaperone',
    description:
      'A tool allow-list names tools, not what a call does with them. Deterministic secret patterns plus a semantic screen on outbound actions, and the limits of both.',
    blurb:
      'Reading a file and posting to a URL are both ordinary. The pair is the problem, and a list of allowed tools cannot express it.',
  },
  {
    slug: 'ecc',
    h1: 'Run agent-chaperone alongside ECC',
    title: 'Run agent-chaperone alongside ECC | agent-chaperone',
    description:
      "Add runtime screening next to ECC's hooks. What AgentShield, GateGuard and agent-chaperone each check, how their hooks run together, and how to start without blocking anything.",
    blurb:
      "ECC checks your setup and makes the agent look before it edits. This checks what each call does and what each result says, and runs next to ECC's hooks without changing them.",
  },
];

export const SITE = 'https://agentchaperone.dev';

export function guideUrl(guide: Guide): string {
  return `${SITE}/guides/${guide.slug}`;
}

export function findGuide(slug: string): Guide {
  const found = GUIDES.find((one) => one.slug === slug);
  if (found === undefined) {
    // A page importing a slug that is not listed would otherwise build with an
    // empty title and ship. Failing the build is the cheaper failure.
    throw new Error(`No guide is listed under the slug "${slug}"`);
  }
  return found;
}
