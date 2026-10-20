import { escapeHTML as text } from '../components/jobs.js';

const token = localStorage.getItem('hireloop_session');
const user = JSON.parse(localStorage.getItem('hireloop_user') || 'null');
const feedback = document.querySelector('#admin-feedback');
const form = document.querySelector('#job-editor');
const modal = document.querySelector('#postJobModal');
let listings = [];
let applications = [];
let categories = [];
let editingId = null;

if (!token || user?.role !== 'company_admin') {
  window.location.href = 'login.html';
}

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
};

function notify(message) {
  feedback.textContent = message;
  feedback.hidden = false;
}

function render() {
  document.querySelector('#active-count').textContent = listings.length;
  document.querySelector('#application-count').textContent = applications.length;
  document.querySelector('#company-name').textContent = user?.company_name || 'Your company';
  document.querySelector('#admin-jobs').innerHTML = listings.map((job) => `<tr>
    <td><div class="fw-bold">${text(job.title)}</div><div class="small text-muted">${text(job.description)}</div></td>
    <td><span class="custom-badge-yellow px-2 py-1 small">${text(job.contract_type)}</span></td>
    <td>${text(job.location)}</td>
    <td class="text-end"><button type="button" class="btn btn-outline-dark btn-sm me-2" data-edit-id="${job.id}" data-bs-toggle="modal" data-bs-target="#postJobModal">Edit</button><button type="button" class="btn btn-outline-danger btn-sm" data-delete-id="${job.id}">Delete</button></td>
  </tr>`).join('');
  document.querySelector('#admin-applications').innerHTML = applications.length
    ? applications.map((application) => {
      let proofPack = [];
      try {
        proofPack = application.proof_pack ? JSON.parse(application.proof_pack) : [];
      } catch {
        proofPack = [];
      }
      const proofChips = proofPack.length
        ? proofPack.map((proof) => `<span class="proof-chip"><i class="bi bi-check2" aria-hidden="true"></i>${text(proof.title || proof.id)}</span>`).join('')
        : '<span class="small text-muted">No Proof Pack items selected.</span>';
      return `<details class="application-item p-3">
      <summary class="fw-bold">${text(application.applicant_name)} <span class="small fw-normal">· ${text(application.job_title)}</span> <span class="status-badge ms-2" data-status="${text(application.status || 'pending')}">${text(application.status || 'pending')}</span></summary>
      <div class="pt-3"><p class="small text-muted">${text(application.applicant_email)}</p><p class="small job-description">${text(application.message || 'No message provided.')}</p>
        <p class="small fw-bold mb-2">Proof Pack</p><div class="d-flex flex-wrap gap-2 mb-3">${proofChips}</div>
        <label class="form-label fw-bold small" for="status-${application.id}">Status</label>
        <select id="status-${application.id}" class="form-select form-select-sm" data-status-id="${application.id}">
          ${['pending', 'reviewed', 'accepted', 'rejected'].map((status) => `<option value="${status}"${status === application.status ? ' selected' : ''}>${status}</option>`).join('')}
        </select>
      </div>
    </details>`;
    }).join('')
    : '<p class="text-muted">No applications yet.</p>';
}

async function loadDashboard() {
  try {
    const [company, jobs, receivedApplications, availableCategories] = await Promise.all([
      request('/company/profile'),
      request('/company/ads'),
      request('/company/applications'),
      request('/categories')
    ]);
    user.company_name = company.name;
    localStorage.setItem('hireloop_user', JSON.stringify(user));
    listings = jobs;
    applications = receivedApplications;
    categories = availableCategories;
    document.querySelector('#categoryId').innerHTML = categories.map((category) => `<option value="${category.id}">${text(category.name)}</option>`).join('');
    render();
  } catch (error) {
    notify(error.message);
  }
}

document.querySelector('#admin-jobs').addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('[data-delete-id]');
  if (!deleteButton) return;
  try {
    await request(`/company/ads/${deleteButton.dataset.deleteId}`, { method: 'DELETE' });
    await loadDashboard();
    notify('Listing deleted.');
  } catch (error) {
    notify(error.message);
  }
});

document.querySelector('#admin-applications').addEventListener('change', async (event) => {
  const applicationId = event.target.dataset.statusId;
  if (!applicationId) return;
  try {
    await request(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: event.target.value })
    });
    const badge = event.target.closest('.application-item')?.querySelector('.status-badge');
    if (badge) {
      badge.dataset.status = event.target.value;
      badge.textContent = event.target.value;
    }
    notify('Application status updated.');
  } catch (error) {
    notify(error.message);
  }
});

modal.addEventListener('show.bs.modal', (event) => {
  form.reset();
  editingId = Number(event.relatedTarget?.dataset.editId) || null;
  const job = listings.find((item) => item.id === editingId);
  document.querySelector('#postJobModalLabel').textContent = job ? 'Edit listing' : 'Post a job';
  document.querySelector('#companyName').value = user?.company_name || '';
  if (!job) return;
  for (const [id, key] of Object.entries({ jobTitle: 'title', location: 'location', salary: 'salary', description: 'description' })) {
    document.getElementById(id).value = job[key] || '';
  }
  document.querySelector('#contractType').value = job.contract_type;
  document.querySelector('#categoryId').value = job.category_id || '';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const value = (id) => document.getElementById(id).value.trim();
  const body = {
    title: value('jobTitle'),
    description: value('description'),
    location: value('location'),
    salary: value('salary'),
    contract_type: value('contractType'),
    category_id: Number(value('categoryId'))
  };
  if (!body.title || !body.description || !body.location || !body.category_id) return notify('Title, description, location, and category are required.');
  try {
    await request(editingId ? `/company/ads/${editingId}` : '/company/ads', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(body) });
    await loadDashboard();
    notify(editingId ? 'Listing updated.' : 'Listing created.');
    window.bootstrap.Modal.getInstance(modal).hide();
  } catch (error) {
    notify(error.message);
  }
});

loadDashboard();
