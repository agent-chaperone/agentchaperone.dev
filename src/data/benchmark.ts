/**
 * The measured run, transcribed from bench/results/report.txt in the tool repo.
 *
 * One run, one model version, one date. Every number on the site comes from
 * here so the landing page and the results page cannot disagree, and so a
 * re-measurement is one edit rather than a search. Nothing here is computed
 * from raw rows: two published numbers for one run is worse than one table.
 */

export const RUN = {
  model: 'jev-1.13.0',
  date: '2026-09-21',
  requests: 1947,
  costUsd: 0.062,
  meanInputTokens: 754,
  toolVersion: '0.1.0',
} as const;

/**
 * The version this site describes, which is the one npm serves.
 *
 * Deliberately not `RUN.toolVersion`. That one says which build produced the
 * measurements and must not move when a release happens, or the numbers would
 * start claiming to come from a run nobody made. This one says what a reader
 * would install today. They were the same version once and are not any more.
 */
export const CURRENT_VERSION = '0.3.2';

/** The thresholds the package actually ships with, from src/policy/schema.ts. */
export const SHIPPED = {
  annotateInstructs: 0.5,
  quarantineInstructs: 0.8,
  harmfulSeverityLevel: 1.5,
  holdDestructive: 0.7,
  holdExfiltration: 0.6,
  redactSecret: 0.7,
} as const;

export interface Sweep {
  readonly threshold: number;
  readonly precision: number | null;
  readonly recall: number | null;
  readonly falsePositives: number;
  readonly falseNegatives: number;
}

export interface Set {
  readonly id: string;
  readonly name: string;
  readonly what: string;
  readonly items: number;
  readonly positives: number;
  readonly auc: number | null;
  readonly side: 'result' | 'call';
  /**
   * The threshold the shipped rule acts at for this side, which is what the
   * counts are reported at. A result is annotated from 0.5. A call is held at
   * 0.6 for exfiltration and 0.7 for a destructive change, and the benchmark
   * scores the higher of those two questions, so the call rows use 0.7: the
   * stricter of the pair, and therefore the smaller catch count of the two.
   */
  readonly reportedAt: number;
  readonly headline: boolean;
  readonly sweeps: readonly Sweep[];
  /** Of the positives, how many the shipped withhold rule would have withheld. */
  readonly withheld?: number;
}

export const SETS: readonly Set[] = [
  {
    id: 'injecagent',
    name: 'InjecAgent tool responses',
    what: 'Tool results carrying an injected instruction, from a public benchmark.',
    items: 1394,
    positives: 1054,
    auc: 0.976,
    side: 'result',
    reportedAt: 0.5,
    headline: true,
    withheld: 359,
    sweeps: [
      { threshold: 0.3, precision: 0.956, recall: 0.949, falsePositives: 46, falseNegatives: 54 },
      { threshold: 0.5, precision: 0.989, recall: 0.805, falsePositives: 9, falseNegatives: 206 },
      { threshold: 0.7, precision: 0.996, recall: 0.516, falsePositives: 2, falseNegatives: 510 },
      { threshold: 0.8, precision: 1.0, recall: 0.343, falsePositives: 0, falseNegatives: 692 },
      { threshold: 0.9, precision: 1.0, recall: 0.128, falsePositives: 0, falseNegatives: 919 },
    ],
  },
  {
    id: 'bipia-email',
    name: 'BIPIA email',
    what: 'Emails with an instruction hidden in the body, from a public benchmark.',
    items: 250,
    positives: 200,
    auc: 1.0,
    side: 'result',
    reportedAt: 0.5,
    headline: true,
    withheld: 10,
    sweeps: [
      { threshold: 0.3, precision: 1.0, recall: 0.85, falsePositives: 0, falseNegatives: 30 },
      { threshold: 0.5, precision: 1.0, recall: 0.825, falsePositives: 0, falseNegatives: 35 },
      { threshold: 0.7, precision: 1.0, recall: 0.665, falsePositives: 0, falseNegatives: 67 },
      { threshold: 0.8, precision: 1.0, recall: 0.53, falsePositives: 0, falseNegatives: 94 },
      { threshold: 0.9, precision: 1.0, recall: 0.235, falsePositives: 0, falseNegatives: 153 },
    ],
  },
  {
    id: 'benign',
    name: 'Benign documents that discuss injection',
    what: 'Pages that talk about prompt injection without performing one. Every flag here is wrong.',
    items: 68,
    positives: 0,
    auc: null,
    side: 'result',
    reportedAt: 0.5,
    headline: true,
    sweeps: [
      { threshold: 0.3, precision: null, recall: null, falsePositives: 13, falseNegatives: 0 },
      { threshold: 0.5, precision: null, recall: null, falsePositives: 8, falseNegatives: 0 },
      { threshold: 0.7, precision: null, recall: null, falsePositives: 3, falseNegatives: 0 },
      { threshold: 0.8, precision: null, recall: null, falsePositives: 1, falseNegatives: 0 },
      { threshold: 0.9, precision: null, recall: null, falsePositives: 0, falseNegatives: 0 },
    ],
  },
  {
    id: 'precall',
    name: 'Hand-labeled tool calls',
    what: 'Calls I labeled myself, leaning toward shell commands because that is where the damage is.',
    items: 100,
    positives: 51,
    auc: 0.993,
    side: 'call',
    reportedAt: 0.7,
    headline: true,
    sweeps: [
      { threshold: 0.3, precision: 0.909, recall: 0.98, falsePositives: 5, falseNegatives: 1 },
      { threshold: 0.5, precision: 0.98, recall: 0.961, falsePositives: 1, falseNegatives: 2 },
      { threshold: 0.7, precision: 0.978, recall: 0.882, falsePositives: 1, falseNegatives: 6 },
      { threshold: 0.8, precision: 1.0, recall: 0.824, falsePositives: 0, falseNegatives: 9 },
      { threshold: 0.9, precision: 1.0, recall: 0.667, falsePositives: 0, falseNegatives: 17 },
    ],
  },
  {
    id: 'deepset',
    name: 'deepset prompt injections',
    what: 'Bare prompt strings rather than tool results. Kept out of the headline because the shape is not what the screen sees in use.',
    items: 116,
    positives: 60,
    auc: 0.949,
    side: 'result',
    reportedAt: 0.5,
    headline: false,
    sweeps: [
      { threshold: 0.3, precision: 1.0, recall: 0.55, falsePositives: 0, falseNegatives: 27 },
      { threshold: 0.5, precision: 1.0, recall: 0.45, falsePositives: 0, falseNegatives: 33 },
      { threshold: 0.7, precision: 1.0, recall: 0.4, falsePositives: 0, falseNegatives: 36 },
      { threshold: 0.8, precision: 1.0, recall: 0.333, falsePositives: 0, falseNegatives: 40 },
      { threshold: 0.9, precision: 1.0, recall: 0.25, falsePositives: 0, falseNegatives: 45 },
    ],
  },
];

/**
 * How much of the hand-labeled set is shell, from the same run.
 *
 * The set leans that way on purpose: a proxy never sees a client's own shell,
 * and that is where the damage concentrates. The denominators are the `precall`
 * set's `items` and `positives` above, so these two are the only new numbers.
 *
 * Counted on `execute_command` alone. The seven `execute` rows run SQL, and a
 * database tool reached over MCP is the case the proxy already covers, so
 * folding them in here would inflate the one number this argument rests on.
 */
export const SHELL = { scored: 37, dangerous: 21 } as const;

/** Observed positive rate per confidence bin, for the headline sets combined. */
export const RELIABILITY = [
  { from: 0.0, to: 0.2, n: 530, observed: 0.111 },
  { from: 0.2, to: 0.4, n: 174, observed: 0.684 },
  { from: 0.4, to: 0.6, n: 294, observed: 0.929 },
  { from: 0.6, to: 0.8, n: 394, observed: 0.975 },
  { from: 0.8, to: 1.0, n: 531, observed: 0.998 },
] as const;

export const REPO = 'https://github.com/agent-chaperone/agent-chaperone';
export const NPM = 'https://www.npmjs.com/package/agent-chaperone';

/** Caught at the annotate line, of the positives in that set. */
export function caught(set: Set): number {
  const at = set.sweeps.find((one) => one.threshold === set.reportedAt);
  return at === undefined ? 0 : set.positives - at.falseNegatives;
}

export function missed(set: Set): number {
  const at = set.sweeps.find((one) => one.threshold === set.reportedAt);
  return at === undefined ? 0 : at.falseNegatives;
}

export function flaggedInError(set: Set): number {
  const at = set.sweeps.find((one) => one.threshold === set.reportedAt);
  return at === undefined ? 0 : at.falsePositives;
}
