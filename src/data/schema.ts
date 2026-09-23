/**
 * Structured data, as one graph per page.
 *
 * A search engine reads this for rich results. An answer engine reads it for
 * something more useful: unambiguous facts it can quote without inferring them
 * from prose, which is what the pages otherwise leave it to do. The name, the
 * licence, the repository, the registry and the date of the measured run are
 * all things a model would otherwise have to guess at from a sentence.
 *
 * One `@graph` rather than several script tags, so each node is declared once
 * and referenced by `@id` from the others. Two nodes describing the same thing
 * under different identifiers is the usual way this goes wrong.
 *
 * None of this needs the CSP loosened. A `ld+json` block is a data block that
 * never executes, so `script-src 'none'` has nothing to act on, which was
 * checked against the deployed header rather than assumed.
 */

import { CURRENT_VERSION, NPM, REPO, RUN } from './benchmark';
import { DOCS, docUrl, type Doc } from './docs';
import { GUIDES, guideUrl, type Guide } from './guides';

const SITE = 'https://agentchaperone.dev';
const ORG = `${SITE}/#organization`;
const SITE_ID = `${SITE}/#website`;
const APP = `${SITE}/#software`;
const SOURCE = `${SITE}/#source`;

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG,
  name: 'agent-chaperone',
  url: SITE,
  logo: `${SITE}/logo.svg`,
  // Where the same thing exists elsewhere. This is what lets an engine treat
  // the repository, the package and this site as one project rather than three.
  sameAs: [REPO, NPM],
};

const WEBSITE = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: SITE,
  name: 'agent-chaperone',
  publisher: { '@id': ORG },
  inLanguage: 'en',
};

const SOURCE_CODE = {
  '@type': 'SoftwareSourceCode',
  '@id': SOURCE,
  name: 'agent-chaperone',
  codeRepository: REPO,
  programmingLanguage: 'TypeScript',
  license: 'https://www.apache.org/licenses/LICENSE-2.0',
  targetProduct: { '@id': APP },
};

const APPLICATION = {
  '@type': 'SoftwareApplication',
  '@id': APP,
  name: 'agent-chaperone',
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'Security',
  operatingSystem: 'macOS, Linux, Windows',
  softwareVersion: CURRENT_VERSION,
  description:
    "agent-chaperone screens an AI agent's tool calls before they run, and the tool results those calls return before the agent reads them. It covers MCP servers through a proxy and a client's own shell, file edits and web fetches through a hooks adapter.",
  url: SITE,
  downloadUrl: NPM,
  softwareHelp: REPO,
  license: 'https://www.apache.org/licenses/LICENSE-2.0',
  author: { '@id': ORG },
  publisher: { '@id': ORG },
  // Free and open source, said in the way a parser reads rather than in prose.
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  isAccessibleForFree: true,
};

export function homeSchema(): unknown {
  return {
    '@context': 'https://schema.org',
    '@graph': [ORGANIZATION, WEBSITE, APPLICATION, SOURCE_CODE],
  };
}

/**
 * The results page describes a measurement, so it says so.
 *
 * `Dataset` rather than `Article`: the page is a table of counts from one run,
 * and the properties that matter are what was measured, when, and against
 * which version. The date is the run's, never the current release: the two are
 * deliberately separate values and conflating them would have the page claiming
 * numbers from a run nobody made.
 */
export function resultsSchema(): unknown {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      WEBSITE,
      {
        '@type': 'Dataset',
        '@id': `${SITE}/results#dataset`,
        name: `agent-chaperone screening results, ${RUN.model}`,
        description: `One run of ${RUN.model} against agent-chaperone ${RUN.toolVersion} on ${RUN.date}: ${RUN.requests.toLocaleString('en-US')} screening requests against public prompt-injection datasets and hand-labeled tool calls, with what was caught, what was missed, and what was flagged in error.`,
        url: `${SITE}/results`,
        license: 'https://www.apache.org/licenses/LICENSE-2.0',
        creator: { '@id': ORG },
        dateCreated: RUN.date,
        datePublished: RUN.date,
        isAccessibleForFree: true,
        measurementTechnique: 'Calibrated probability screening of tool calls and tool results',
        variableMeasured: ['precision', 'recall', 'false positives', 'false negatives'],
        about: { '@id': APP },
      },
      APPLICATION,
    ],
  };
}

const GUIDES_ID = `${SITE}/guides#collection`;

/**
 * Where a guide sits, said as a list rather than left to the URL.
 *
 * A crawler infers the nesting from the path. An answer engine quoting one page
 * out of context does not, and the breadcrumb is the part that survives being
 * quoted: it names the section the page belongs to without the prose saying so.
 */
function breadcrumb(section: 'Guides' | 'Docs', name: string, url: string): unknown {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'agent-chaperone', item: SITE },
      {
        '@type': 'ListItem',
        position: 2,
        name: section,
        item: `${SITE}/${section.toLowerCase()}`,
      },
      { '@type': 'ListItem', position: 3, name, item: url },
    ],
  };
}

/**
 * One guide.
 *
 * `TechArticle` rather than `Article`: each of these is a procedure with
 * configuration in it, addressed to somebody setting the thing up, and the type
 * says that without the prose having to. `about` points at the application node
 * rather than restating it, so a reader that already resolved the software from
 * the home page does not meet a second copy of it here under another id.
 */
export function guideSchema(guide: Guide): unknown {
  const url = guideUrl(guide);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      WEBSITE,
      {
        '@type': 'TechArticle',
        '@id': `${url}#article`,
        headline: guide.h1,
        name: guide.h1,
        description: guide.description,
        url,
        mainEntityOfPage: url,
        inLanguage: 'en',
        isPartOf: { '@id': SITE_ID },
        about: { '@id': APP },
        author: { '@id': ORG },
        publisher: { '@id': ORG },
        license: 'https://www.apache.org/licenses/LICENSE-2.0',
        isAccessibleForFree: true,
        // The release the page describes, not the build. A rebuild that changed
        // nothing should not claim the page is newer than the tool it documents.
        datePublished: RUN.date,
        dateModified: RUN.date,
        proficiencyLevel: 'Expert',
        dependencies: `agent-chaperone ${CURRENT_VERSION}`,
      },
      breadcrumb('Guides', guide.h1, url),
      APPLICATION,
    ],
  };
}

/**
 * The guides index.
 *
 * `CollectionPage` naming every member, so a reader that fetches this one page
 * comes away knowing the others exist and what each answers, rather than
 * having to crawl the section to find out.
 */
export function guidesIndexSchema(): unknown {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      WEBSITE,
      {
        '@type': 'CollectionPage',
        '@id': GUIDES_ID,
        name: 'agent-chaperone guides',
        description:
          "Setting up screening for MCP servers, for a client's own shell and file tools, for prompt injection arriving in tool results, for secrets on their way out, and next to ECC's hooks.",
        url: `${SITE}/guides`,
        isPartOf: { '@id': SITE_ID },
        about: { '@id': APP },
        inLanguage: 'en',
        hasPart: GUIDES.map((guide) => ({
          '@type': 'TechArticle',
          '@id': `${guideUrl(guide)}#article`,
          headline: guide.h1,
          description: guide.description,
          url: guideUrl(guide),
        })),
      },
      APPLICATION,
    ],
  };
}

const DOCS_ID = `${SITE}/docs#collection`;

/**
 * One reference document.
 *
 * `TechArticle` like the guides, and `isBasedOn` names the file in the
 * repository, because that file is the original and this page is a copy of it.
 * A reader weighing the page can see where the text is maintained, and an engine
 * that already knows the repository can tie the two together.
 */
export function docSchema(doc: Doc, headline: string): unknown {
  const url = docUrl(doc);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      WEBSITE,
      {
        '@type': 'TechArticle',
        '@id': `${url}#article`,
        headline,
        name: headline,
        description: doc.description,
        url,
        mainEntityOfPage: url,
        inLanguage: 'en',
        isPartOf: { '@id': SITE_ID },
        isBasedOn: `${REPO}/blob/main/${doc.source}`,
        about: { '@id': APP },
        author: { '@id': ORG },
        publisher: { '@id': ORG },
        license: 'https://www.apache.org/licenses/LICENSE-2.0',
        isAccessibleForFree: true,
        datePublished: RUN.date,
        dateModified: RUN.date,
        proficiencyLevel: 'Expert',
        dependencies: `agent-chaperone ${CURRENT_VERSION}`,
      },
      breadcrumb('Docs', headline, url),
      APPLICATION,
    ],
  };
}

/** The docs index, naming every member, for the same reason as the guides index. */
export function docsIndexSchema(headlines: Readonly<Record<string, string>>): unknown {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      WEBSITE,
      {
        '@type': 'CollectionPage',
        '@id': DOCS_ID,
        name: 'agent-chaperone reference documents',
        description:
          'The design, the hooks adapter reference and the benchmark method, copied from the repository and kept identical to it.',
        url: `${SITE}/docs`,
        isPartOf: { '@id': SITE_ID },
        about: { '@id': APP },
        inLanguage: 'en',
        hasPart: DOCS.map((doc) => ({
          '@type': 'TechArticle',
          '@id': `${docUrl(doc)}#article`,
          headline: headlines[doc.slug] ?? doc.title,
          description: doc.description,
          url: docUrl(doc),
        })),
      },
      APPLICATION,
    ],
  };
}
