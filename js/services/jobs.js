export async function listJobs({ q = '', location = '', category = '', contract = '' } = {}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (location.trim()) params.set('location', location.trim());
  if (category) params.set('category', category);
  if (contract) params.set('contract', contract);
  const query = params.toString();
  const response = await fetch(query ? `/ads?${query}` : '/ads');
  if (!response.ok) throw new Error('Unable to load job opportunities.');
  return response.json();
}

export async function getJob(id) {
  const response = await fetch(`/ads/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Job not found. Choose another opportunity from the board.');
  return response.json();
}