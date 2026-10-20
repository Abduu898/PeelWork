import { jobs } from '../data/jobs.js';

// Frontend-only adapter: the pages need not change when this becomes an API call.
export async function listJobs({ q = '', location = '' } = {}) {
  const keyword = q.trim().toLowerCase();
  const place = location.trim().toLowerCase();
  return jobs.filter((job) =>
    [job.title, job.description, job.company_name, job.category_name].join(' ').toLowerCase().includes(keyword) &&
    job.location.toLowerCase().includes(place));
}

export async function getJob(id) {
  const job = jobs.find((item) => String(item.id) === String(id));
  if (!job) throw new Error('Job not found. Choose another opportunity from the board.');
  return job;
}
