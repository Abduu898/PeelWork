export async function listJobs({ q = '', location = '' } = {}) {
  const response = await fetch('/ads');
  if (!response.ok) throw new Error('Unable to load job opportunities.');
  const jobs = await response.json();
  const keyword = q.trim().toLowerCase();
  const place = location.trim().toLowerCase();
  return jobs.filter((job) =>
    [job.title, job.description, job.company_name, job.category_name].join(' ').toLowerCase().includes(keyword) &&
    (job.location || '').toLowerCase().includes(place));
}

export async function getJob(id) {
  const response = await fetch(`/ads/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Job not found. Choose another opportunity from the board.');
  return response.json();
}
