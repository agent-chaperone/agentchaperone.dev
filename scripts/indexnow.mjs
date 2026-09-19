#!/usr/bin/env node
/**
 * Tell the IndexNow participants that these pages changed.
 *
 * Deliberately a command someone runs, not a step in the deploy. Three static
 * pages that change when a version ships do not need a push protocol firing on
 * every build, and a hook that submits unchanged pages on every commit is how a
 * domain earns a rate limit.
 *
 * Run it after a release that changed the site:
 *
 *     node scripts/indexnow.mjs
 *     node scripts/indexnow.mjs --dry-run
 *
 * Who listens: Bing, Yandex, Naver, Seznam, Yep and Amazon. Google is not a
 * participant, so this does nothing for Google Search and nothing for AI
 * Overviews. Search Console's URL Inspection is the equivalent there, and it is
 * a button rather than an API.
 *
 * The key is not a secret. IndexNow verifies ownership by requiring the key to
 * be readable at the domain it authorises, so it is public by design and
 * authorises nothing anywhere else.
 */

const HOST = 'agentchaperone.dev';
const KEY = '13a43bd0c536446eaca1c087990db4fa';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Everything worth announcing. The markdown twins are the same content. */
const URLS = [`https://${HOST}/`, `https://${HOST}/results`];

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const keyLocation = `https://${HOST}/${KEY}.txt`;

  // Submitting before the key file is reachable is rejected, and the rejection
  // does not say why. Checked first so the failure names its own cause.
  const hosted = await fetch(keyLocation).catch(() => undefined);
  if (hosted === undefined || !hosted.ok) {
    console.error(`The key is not readable at ${keyLocation}, so a submission would be refused.`);
    console.error('Deploy the site first; the file lives in public/.');
    process.exit(1);
  }
  const served = (await hosted.text()).trim();
  if (served !== KEY) {
    console.error(`${keyLocation} does not contain the key it should.`);
    process.exit(1);
  }

  const body = { host: HOST, key: KEY, keyLocation, urlList: URLS };
  if (dryRun) {
    console.log('Would submit:');
    console.log(JSON.stringify(body, null, 2));
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  // 200 is accepted, 202 is accepted with the key still being validated. Both
  // mean the submission landed.
  if (response.status === 200 || response.status === 202) {
    console.log(`Submitted ${URLS.length} URLs (HTTP ${response.status}).`);
    return;
  }
  const why = {
    400: 'the request was malformed',
    403: 'the key was rejected for this host',
    422: 'a URL did not belong to this host, or the key did not match',
    429: 'too many submissions; wait rather than retrying',
  };
  console.error(
    `IndexNow refused it: HTTP ${response.status}, ${why[response.status] ?? 'unknown'}`,
  );
  process.exit(1);
}

await main();
