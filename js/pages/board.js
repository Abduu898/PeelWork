import { listJobs, getJob } from '../services/jobs.js';
import { jobCard, jobDetails, escapeHTML } from '../components/jobs.js';

const form = document.querySelector('#job-search');
const grid = document.querySelector('#job-grid');
const status = document.querySelector('#jobs-status');
const count = document.querySelector('#job-count');
const panel = document.querySelector('#job-details');
const content = document.querySelector('#job-details-content');
const categoryFilter = form.elements.category;
const contractFilter = form.elements.contract;
let selectedLink;

function closeDetails() {
  panel.hidden = true;
  selectedLink?.setAttribute('aria-expanded', 'false');
}

async function loadJobs() {
  closeDetails();
  status.textContent = 'Loading opportunities…';
  grid.replaceChildren();
  grid.setAttribute('aria-busy', 'true');
  count.textContent = 'Loading…';
  const params = new URLSearchParams(new FormData(form));
  history.replaceState(null, '', `${location.pathname}?${params}`);
  try {
    const jobs = await listJobs(Object.fromEntries(params));
    grid.innerHTML = jobs.map(jobCard).join('');
    count.textContent = `${jobs.length} ${jobs.length === 1 ? 'Job' : 'Jobs'} Available`;
    status.textContent = jobs.length ? '' : 'No jobs match your search. Try another keyword or location.';
    grid.setAttribute('aria-busy', 'false');
  } catch (error) {
    count.textContent = 'Jobs unavailable';
    status.textContent = `${error.message} Use Search to try again.`;
    grid.setAttribute('aria-busy', 'false');
  }
}

form.addEventListener('submit', (event) => { event.preventDefault(); loadJobs(); });
document.querySelector('#close-details').addEventListener('click', () => {
  closeDetails();
  selectedLink?.focus();
});
grid.addEventListener('click', async (event) => {
  const link = event.target.closest('[data-job-id]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  closeDetails();
  selectedLink = link;
  link.setAttribute('aria-expanded', 'true');
  panel.hidden = false;
  content.textContent = 'Loading job details…';
  document.querySelector('#open-job-page').hidden = true;
  panel.setAttribute('aria-busy', 'true');
  panel.focus();
  panel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  try {
    const job = await getJob(link.dataset.jobId);
    content.innerHTML = jobDetails(job);
    document.querySelector('#open-job-page').href = `job-detail.html?id=${encodeURIComponent(job.id)}`;
    document.querySelector('#open-job-page').hidden = false;
    panel.setAttribute('aria-busy', 'false');
  } catch (error) {
    content.textContent = error.message;
    panel.setAttribute('aria-busy', 'false');
  }
});
const params = new URLSearchParams(location.search);
for (const name of ['q', 'location', 'category', 'contract']) {
  if (form.elements[name]) form.elements[name].value = params.get(name) || '';
}
if (categoryFilter) {
  fetch('/categories').then((response) => response.json()).then((categories) => {
    categoryFilter.innerHTML = '<option value="">All categories</option>' + categories.map((category) => `<option value="${category.id}">${escapeHTML(category.name)}</option>`).join('');
    categoryFilter.value = params.get('category') || '';
  }).catch(() => { categoryFilter.innerHTML = '<option value="">All categories</option>'; });
}
loadJobs();
