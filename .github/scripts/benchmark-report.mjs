/* oxlint-disable typescript/no-unsafe-member-access, typescript/no-unsafe-return */
// Native github-script API objects and parsed JSON have no SDK types here.

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

export async function publish({ github, context, core }) {
  const source = {
    pr: context.payload.pull_request.number,
    run: context.runId,
    number: context.runNumber,
    attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    base: process.env.BASE_SHA,
    head: process.env.HEAD_SHA,
  };

  const repository = context.repo;

  const skip = (reason) => {
    core.notice(`Benchmark report skipped: ${reason}`);
  };

  let rows;

  try {
    const measurement = await readJson(path.join(process.env.RESULTS, 'measurement.json'));

    if (measurement?.base !== source.base || measurement?.head !== source.head) {
      skip('measurement SHAs do not match the producer base and head');

      return;
    }

    const baseDirectory = path.join(process.env.RESULTS, 'full');
    const headDirectory = path.join(baseDirectory, 'current');
    const baseEntries = await readdir(baseDirectory);
    const headEntries = await readdir(headDirectory);
    const baseFiles = baseEntries.filter((file) => file !== 'current').toSorted((a, b) => a.localeCompare(b));
    const headFiles = headEntries.toSorted((a, b) => a.localeCompare(b));

    if (
      baseFiles.length === 0 ||
      baseFiles.length !== headFiles.length ||
      baseFiles.some((file, index) => file !== headFiles[index] || !/^[a-z0-9][a-z0-9.-]{0,95}\.json$/u.test(file))
    ) {
      skip('native results must contain matching JSON files with safe workload IDs');

      return;
    }

    rows = [];

    for (const file of baseFiles) {
      const baseResult = await readJson(path.join(baseDirectory, file));
      const headResult = await readJson(path.join(headDirectory, file));
      const base = Number.isFinite(baseResult?.latency?.mean) ? baseResult.latency.mean / 4 : Number.NaN;
      const head = Number.isFinite(headResult?.latency?.mean) ? headResult.latency.mean / 4 : Number.NaN;
      const change = (head / base - 1) * 100;

      if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(head) || head <= 0 || !Number.isFinite(change)) {
        skip('latency means and per-search values must be finite and positive');

        return;
      }

      rows.push(
        `| \`${file.slice(0, -5)}\` | ${base.toPrecision(4)} | ${head.toPrecision(4)} | ${change >= 0 ? '+' : ''}${change.toPrecision(3)}% |`,
      );
    }
  } catch {
    skip('native result JSON is missing, unreadable, or invalid');

    return;
  }

  const marker = '<!-- benchmark-report -->';

  const comments = await github.paginate(github.rest.issues.listComments, {
    ...repository,
    issue_number: source.pr,
    per_page: 100,
  });

  const matching = comments.filter(
    (comment) =>
      comment.user?.type === 'Bot' && comment.user.login === 'github-actions[bot]' && comment.body?.startsWith(marker),
  );

  if (matching.length > 1) {
    skip('multiple bot report comments exist');

    return;
  }

  const comment = matching[0];

  if (comment) {
    const previous = comment.body.match(/<!-- benchmark-run:([a-f0-9]{40}):(\d+):(\d+):(\d+) -->/u);

    if (!previous) {
      skip('the existing report has no trusted run identity');

      return;
    }

    if (
      previous[1] === source.head &&
      (Number(previous[3]) > source.number ||
        (Number(previous[3]) === source.number &&
          (Number(previous[2]) !== source.run || Number(previous[4]) >= source.attempt)))
    ) {
      skip('an equal or newer report already exists for this head');

      return;
    }
  }

  const url = `${context.serverUrl}/${repository.owner}/${repository.repo}`;

  const body = [
    marker,
    `<!-- benchmark-run:${source.head}:${source.run}:${source.number}:${source.attempt} -->`,
    '## Benchmark Comparison',
    '',
    '| Workload | Base, ms/search | PR, ms/search | Change |',
    '| --- | ---: | ---: | ---: |',
    ...rows,
    '',
    `[Base ${source.base}](${url}/commit/${source.base}) · [PR ${source.head}](${url}/commit/${source.head}) · [Run ${source.number}, attempt ${source.attempt}](${url}/actions/runs/${source.run}/attempts/${source.attempt})`,
  ].join('\n');

  const { data: pr } = await github.rest.pulls.get({
    ...repository,
    pull_number: source.pr,
  });

  if (pr.state !== 'open' || pr.base.sha !== source.base || pr.head.sha !== source.head) {
    skip('PR closed or base/head changed before publication');

    return;
  }

  // GitHub has no compare-and-swap for comments. A PR update can still race this final check and write.
  await (comment
    ? github.rest.issues.updateComment({
        ...repository,
        comment_id: comment.id,
        body,
      })
    : github.rest.issues.createComment({
        ...repository,
        issue_number: source.pr,
        body,
      }));

  await core.summary.addRaw(body).write();
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}
