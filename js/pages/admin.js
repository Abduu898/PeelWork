import { jobs } from '../data/jobs.js';
import { sampleApplications } from '../data/proofs.js';
import { escapeHTML as text } from '../components/jobs.js';

const listings = structuredClone(jobs).map((job) => ({ ...job, status: 'Published' }));
const applications = structuredClone(sampleApplications);
const feedback = document.querySelector('#admin-feedback');
const form = document.querySelector('#job-editor');
const modal = document.querySelector('#postJobModal');
let editingId = null;

function notify(message) { feedback.textContent = message; feedback.hidden = false; }

function render() {
  document.querySelector('#active-count').textContent = listings.filter((job) => job.status === 'Published').length;
  document.querySelector('#application-count').textContent = applications.length;
  const companies = [...new Set(listings.map((job) => job.company_name))];
  document.querySelector('#company-count').textContent = companies.length;
  document.querySelector('#admin-jobs').innerHTML = listings.map((job) => `<tr>
    <td><div class="fw-bold">${text(job.title)}</div><div class="small text-muted">${text(job.company_name)} · ${text(job.location)}</div></td>
    <td><span class="custom-badge-yellow px-2 py-1 small">${text(job.contract_type)}</span></td>
    <td class="small">${text(job.status)}</td><td>${applications.filter((item) => item.job_id === job.id).length}</td>
    <td class="text-end"><div class="d-flex gap-2 justify-content-end">
      <button type="button" class="btn btn-outline-dark btn-sm" data-bs-toggle="modal" data-bs-target="#postJobModal" data-edit-id="${job.id}" aria-label="Edit ${text(job.title)}">Edit</button>
      <button type="button" class="btn btn-outline-dark btn-sm" data-archive-id="${job.id}" aria-label="${job.status === 'Published' ? 'Archive' : 'Restore'} ${text(job.title)}">${job.status === 'Published' ? 'Archive' : 'Restore'}</button>
    </div></td></tr>`).join('');
  document.querySelector('#admin-companies').innerHTML = companies.map((name) => {
    const records = listings.filter((job) => job.company_name === name);
    return `<tr><td class="fw-bold">${text(name)}</td><td class="small text-secondary">${text(records[0].company_description || 'Company added in this preview.')}</td><td>${records.filter((job) => job.status === 'Published').length}</td></tr>`;
  }).join('');
}

document.querySelector('#admin-applications').innerHTML = applications.map((application) => `<details class="border border-2 border-dark rounded-3 p-3">
  <summary class="fw-bold">${text(application.name)} <span class="small fw-normal">· ${text(application.job_title)} · ${application.proofs.length} ${application.proofs.length === 1 ? 'proof' : 'proofs'}</span></summary>
  <div class="pt-3"><p class="small text-muted">Sample contact: ${text(application.email)}</p><p class="small job-description">${text(application.message)}</p>
    <h3 class="h6 fw-bold">Submitted Proof Pack</h3>
    ${application.proofs.length ? application.proofs.map((proof) => `<div class="bg-light border rounded-2 p-3 mb-3"><p class="fw-bold small mb-1">${text(proof.title)}</p><p class="small mb-1">${text(proof.description)}</p><p class="small text-muted mb-0">${proof.skills.map(text).join(' · ')}</p></div>`).join('') : '<p class="small text-muted">No proofs attached. This application can still be reviewed.</p>'}
    <label for="status-${application.id}" class="form-label fw-bold small">Application status</label>
    <select id="status-${application.id}" class="form-select form-select-sm" data-application-id="${application.id}">${['New', 'In review', 'Contacted', 'Closed'].map((status) => `<option${status === application.status ? ' selected' : ''}>${status}</option>`).join('')}</select>
  </div></details>`).join('');

document.querySelector('#admin-applications').addEventListener('change', (event) => {
  const application = applications.find((item) => String(item.id) === event.target.dataset.applicationId);
  if (!application) return;
  application.status = event.target.value;
  notify(`${application.name}'s application is now “${application.status}” in this preview.`);
});

document.querySelector('#admin-jobs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-archive-id]');
  if (!button) return;
  const job = listings.find((item) => String(item.id) === button.dataset.archiveId);
  job.status = job.status === 'Published' ? 'Archived' : 'Published';
  render();
  notify(`${job.title}: ${job.status.toLowerCase()} in this preview.`);
  document.querySelector(`[data-archive-id="${job.id}"]`).focus();
});

modal.addEventListener('show.bs.modal', (event) => {
  form.reset();
  for (const input of form.querySelectorAll('input, textarea')) input.setCustomValidity('');
  editingId = Number(event.relatedTarget?.dataset.editId) || null;
  const job = listings.find((item) => item.id === editingId);
  document.querySelector('#postJobModalLabel').textContent = job ? 'Edit sample job' : 'Add sample job';
  if (!job) return;
  for (const [id, key] of Object.entries({ jobTitle: 'title', companyName: 'company_name', location: 'location', salary: 'salary', description: 'description' })) document.getElementById(id).value = job[key] || '';
  document.querySelector('#contractType').value = job.contract_type;
  document.querySelector('#requiredSkills').value = (job.required_skills || []).join(', ');
});

form.addEventListener('input', (event) => event.target.setCustomValidity?.(''));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  for (const id of ['jobTitle', 'companyName', 'location', 'description']) {
    const input = document.getElementById(id);
    if (!input.value.trim()) { input.setCustomValidity('Please enter a value.'); input.reportValidity(); return; }
  }
  const value = (id) => document.getElementById(id).value.trim();
  const updated = { title: value('jobTitle'), company_name: value('companyName'), location: value('location'), salary: value('salary'), contract_type: value('contractType'), description: value('description'), required_skills: value('requiredSkills').split(',').map((skill) => skill.trim()).filter(Boolean) };
  const existing = listings.find((job) => job.id === editingId);
  if (existing) Object.assign(existing, updated);
  else listings.unshift({ ...updated, id: Math.max(...listings.map((job) => job.id)) + 1, status: 'Published' });
  render();
  notify(`${updated.title} saved in this admin preview. Changes reset on reload.`);
  window.bootstrap.Modal.getInstance(modal).hide();
});

render();
