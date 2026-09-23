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
      'Put an MCP server behind a screening proxy with one config change. What each screen asks, how to start in shadow mode, and what a proxy cannot see.',
    blurb:
      'One change to a client configuration puts a server behind the screen. What crosses the proxy, what the pre-call and post-result screens ask, and where a proxy stops seeing anything.',
  },
  {
    slug: 'prompt-injection',
    h1: 'Screen tool results for prompt injection before the agent reads them',
    title: 'Screen tool results for prompt injection | agent-chaperone',
    description:
      'Tool results are text an agent reads as input. How the post-result screen finds hidden instructions, when it annotates or withholds, and what it misses.',
    blurb:
      'A fetched page, a file and an API response are all text somebody else wrote, and the agent reads them as input. What the screen catches, and the measured count of what it does not.',
  },
  {
    slug: 'claude-code',
    h1: "Screen Claude Code's built-in tools",
    title: "Screen Claude Code's built-in tools | agent-chaperone",
    description:
      "Claude Code's shell commands, file edits and web fetches run outside MCP, where a proxy never sees them. The hooks that screen them, and what they miss.",
    blurb:
      'A proxy sees MCP traffic and nothing else. Three hooks put the same screens in front of the shell, the file edits and the fetches a client runs itself.',
  },
  {
    slug: 'secret-exfiltration',
    h1: 'Catch secret-leaking tool calls before they run',
    title: 'Catch secret-leaking tool calls before they run | agent-chaperone',
    description:
      'An allow-list names tools, not what a call does with them. Deterministic secret patterns plus a semantic screen on outbound calls, and the limits of both.',
    blurb:
      'Reading a file and posting to a URL are both ordinary. The pair is the problem, and a list of allowed tools cannot express it.',
  },
  {
    slug: 'ecc',
    h1: 'Run agent-chaperone alongside ECC',
    title: 'Run agent-chaperone alongside ECC | agent-chaperone',
    description:
      "Runtime screening next to ECC's hooks: what AgentShield, GateGuard and agent-chaperone each check, how the hooks run together, and starting in shadow mode.",
    blurb:
      "ECC checks your setup and makes the agent look before it edits. This checks what each call does and what each result says, and runs next to ECC's hooks without changing them.",
  },
  {
    slug: 'cursor',
    h1: 'Screen MCP tool calls in Cursor',
    title: 'Screen MCP tool calls in Cursor | agent-chaperone',
    description:
      "Put Cursor's MCP servers behind agent-chaperone: the mcp.json change, getting the API key to the proxy, checking it works, and what it does not cover.",
    blurb:
      'Cursor keeps servers in JSON that wrap can edit. The change, how the key reaches the proxy, and what Cursor runs outside MCP.',
  },
  {
    slug: 'codex',
    h1: 'Screen MCP tool calls in Codex',
    title: 'Screen MCP tool calls in Codex | agent-chaperone',
    description:
      "Put Codex's MCP servers behind agent-chaperone: the config.toml change, forwarding the API key past a cleared environment, and timeouts.",
    blurb:
      'Codex keeps servers in TOML and starts them with a cleared environment, so the key has to be forwarded by name. The change, by hand, and the timeouts to set.',
  },
  {
    slug: 'vscode',
    h1: 'Screen MCP tool calls in VS Code',
    title: 'Screen MCP tool calls in VS Code | agent-chaperone',
    description:
      "Put VS Code agent mode's MCP servers behind agent-chaperone: the mcp.json change, the API key, when wrap can edit the file, and what it misses.",
    blurb:
      'VS Code lists servers under servers rather than mcpServers and allows comments in the file. The change, the key, and where wrap has to give way to a hand edit.',
  },
  {
    slug: 'gemini-cli',
    h1: 'Screen MCP tool calls in Gemini CLI',
    title: 'Screen MCP tool calls in Gemini CLI | agent-chaperone',
    description:
      "Put Gemini CLI's MCP servers behind agent-chaperone, and get the API key past the filter that strips anything named like a credential.",
    blurb:
      "Gemini CLI strips variables named like credentials from a server's environment, the API key included. The change, and the env line that gets the key through.",
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
