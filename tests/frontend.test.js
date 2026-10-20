const { test } = require('node:test');
const assert = require('node:assert/strict');

test('search combines keyword and location, ignoring case and surrounding spaces', async () => {
  const { listJobs } = await import('../js/services/jobs.js');
  assert.equal((await listJobs()).length, 3);
  assert.equal((await listJobs({ q: ' react ', location: ' PARIS ' }))[0].id, 1);
  assert.equal((await listJobs({ q: 'designer', location: 'lyon' })).length, 0);
  assert.equal((await listJobs({ location: 'remote' }))[0].id, 2);
  assert.equal((await listJobs({ q: 'cloudscale' }))[0].id, 3);
});

test('each job opens its own details and missing jobs report an error', async () => {
  const { getJob } = await import('../js/services/jobs.js');
  assert.equal((await getJob('2')).title, 'Product Designer');
  await assert.rejects(getJob('999'), /Job not found/);
});

test('job content cannot inject markup into cards or details', async () => {
  const { jobCard, jobDetails } = await import('../js/components/jobs.js');
  const { getJob } = await import('../js/services/jobs.js');
  const job = { ...await getJob(1), title: '<img src=x onerror=alert(1)>', description: '<script>alert(1)</script>' };
  for (const render of [jobCard, jobDetails]) {
    assert.doesNotMatch(render(job), /<script>|<img/);
    assert.match(render(job), /&lt;/);
  }
});
