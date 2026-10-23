import { escapeHTML as text } from '../components/jobs.js';
import { authHeaders, clearSession, getStoredUser, getToken } from '../services/auth.js';

const token = getToken();
const user = getStoredUser();
const feedback = document.querySelector('#admin-feedback');
const form = document.querySelector('#job-editor');
const modal = document.querySelector('#postJobModal');
const companyProfileModal = document.querySelector('#companyProfileModal');
const companyProfileForm = document.querySelector('#company-profile-form');
const companyProfileFeedback = document.querySelector('#company-profile-feedback');
let listings = [];
let applications = [];
let categories = [];
let editingId = null;
let applicationFilter = 'all';

if (!token || user?.role !== 'company_admin') {
  window.location.href = 'login.html';
}

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: authHeaders({ 'Content-Type': 'application/json', ...(options.headers || {}) })
  });
  if (response.status === 401) {
    clearSession();
    window.location.href = 'login.html';
    return null;
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
};

function notify(message) {
  feedback.textContent = message;
  feedback.hidden = false;
}

function populateCompanyProfile(company) {
  for (const [name, value] of Object.entries(company)) {
    const field = companyProfileForm.elements[name];
    if (field) field.value = value || '';
  }
  document.querySelector('#company-profile-summary-name').textContent = company.name || 'Your company';
  document.querySelector('#company-profile-summary-meta').textContent =
    [company.industry, company.location].filter(Boolean).join(' · ') || 'Add your industry and location';
  document.querySelector('#company-profile-summary-description').textContent =
    company.description || 'Complete your profile so candidates can understand your team.';
  for (const [id, value] of [['company-profile-summary-size', company.company_size], ['company-profile-summary-remote', company.remote_policy]]) {
    const badge = document.querySelector(`#${id}`);
    badge.textContent = value || '';
    badge.hidden = !value;
  }
  for (const [id, value, label] of [
    ['company-profile-summary-website', company.website_url, 'Website'],
    ['company-profile-summary-linkedin', company.linkedin_url, 'LinkedIn']
  ]) {
    const link = document.querySelector(`#${id}`);
    link.href = value || '#';
    link.textContent = value ? label : '';
    link.hidden = !value;
  }
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
  const counts = ['pending', 'reviewed', 'accepted', 'rejected'].map((status) => ({
    status,
    count: applications.filter((application) => (application.status || 'pending') === status).length
  }));
  document.querySelector('#application-pipeline').innerHTML = counts.map(({ status, count }) => `
    <div class="col"><div class="pipeline-card" data-status="${status}">
      <span class="small text-uppercase fw-bold">${status === 'pending' ? 'New' : status === 'reviewed' ? 'In review' : status}</span>
      <strong>${count}</strong>
    </div></div>`).join('');
  const visibleApplications = applicationFilter === 'all'
    ? applications
    : applications.filter((application) => (application.status || 'pending') === applicationFilter);
  document.querySelector('#admin-applications').innerHTML = visibleApplications.length
    ? visibleApplications.map((application) => {
      const status = application.status || 'pending';
      const profile = [application.headline, application.location].filter(Boolean).join(' · ');
      return `<article class="application-item p-3">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div class="d-flex gap-3 align-items-start">
            <span class="candidate-avatar" aria-hidden="true">${text(application.applicant_name.charAt(0).toUpperCase())}</span>
            <div><h3 class="h6 fw-bold mb-1">${text(application.applicant_name)}</h3><p class="small text-muted mb-1">${text(profile || application.applicant_email)}</p><p class="small fw-semibold mb-0">Applied for ${text(application.job_title)}</p></div>
          </div>
          <span class="status-badge" data-status="${text(status)}">${text(status === 'pending' ? 'New' : status)}</span>
        </div>
        <div class="application-meta mt-3">
          <span><i class="bi bi-envelope me-1" aria-hidden="true"></i>${text(application.applicant_email)}</span>
          ${application.phone ? `<span><i class="bi bi-telephone me-1" aria-hidden="true"></i>${text(application.phone)}</span>` : ''}
          <span><i class="bi bi-calendar3 me-1" aria-hidden="true"></i>${new Date(application.created_at).toLocaleDateString()}</span>
        </div>
        <p class="small job-description mt-3 mb-3">${text(application.message || 'No message provided.')}</p>
        <details class="candidate-profile-details">
          <summary class="small fw-bold">View candidate profile</summary>
          <div class="row g-3 small mt-1">
            <div class="col-md-6"><strong>Skills</strong><p class="text-secondary mb-0">${text(application.skills || 'Not provided')}</p></div>
            <div class="col-md-6"><strong>Experience</strong><p class="text-secondary mb-0">${text(application.experience || 'Not provided')}</p></div>
            <div class="col-md-6"><strong>Education</strong><p class="text-secondary mb-0">${text(application.education || 'Not provided')}</p></div>
            <div class="col-md-6"><strong>About</strong><p class="text-secondary mb-0">${text(application.bio || 'Not provided')}</p></div>
            <div class="col-12 d-flex gap-3">${application.portfolio_url ? `<a href="${text(application.portfolio_url)}" target="_blank" rel="noreferrer">Portfolio</a>` : ''}${application.linkedin_url ? `<a href="${text(application.linkedin_url)}" target="_blank" rel="noreferrer">LinkedIn</a>` : ''}</div>
          </div>
        </details>
        <div class="d-flex align-items-center flex-wrap gap-2 mt-3 pt-3 border-top border-2 border-dark">
          <span class="small fw-bold me-1">Move to:</span>
          ${['reviewed', 'accepted', 'rejected'].map((nextStatus) => `<button type="button" class="btn btn-sm ${nextStatus === 'accepted' ? 'btn-yellow' : 'btn-outline-dark'}" data-status-id="${application.id}" data-next-status="${nextStatus}"${status === nextStatus ? ' disabled' : ''}>${nextStatus === 'reviewed' ? 'In review' : nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}</button>`).join('')}
          ${status !== 'pending' ? `<button type="button" class="btn btn-link btn-sm text-dark" data-status-id="${application.id}" data-next-status="pending">Mark new</button>` : ''}
        </div>
      </article>`;
    }).join('')
    : '<p class="text-muted">No applications in this stage.</p>';
}

async function loadDashboard() {
  try {
    const [companyResult, jobsResult, applicationsResult, categoriesResult] = await Promise.allSettled([
      request('/company/profile'),
      request('/company/ads'),
      request('/company/applications'),
      request('/categories')
    ]);
    if (companyResult.status === 'rejected') throw companyResult.reason;
    if (jobsResult.status === 'rejected') throw jobsResult.reason;
    const company = companyResult.value;
    const jobs = jobsResult.value;
    const receivedApplications = applicationsResult.status === 'fulfilled' ? applicationsResult.value : [];
    const availableCategories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
    if (applicationsResult.status === 'rejected') {
      notify(`Applications could not be loaded. Run migrations/001_candidate_profiles.sql, then refresh. ${applicationsResult.reason.message}`);
    }
    if (categoriesResult.status === 'rejected') {
      notify(`Categories could not be loaded. ${categoriesResult.reason.message}`);
    }
    user.company_name = company.name;
    populateCompanyProfile(company);
    localStorage.setItem('hireloop_user', JSON.stringify(user));
    listings = jobs;
    applications = receivedApplications;
    categories = availableCategories;
    document.querySelector('#categoryId').innerHTML = categories.map((category) => `<option value="${category.id}">${text(category.name)}</option>`).join('');
    render();
  } catch (error) {
    notify(error.message);
  }

  companyProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    companyProfileFeedback.hidden = true;
    try {
      const company = await request('/company/profile', {
        method: 'PUT',
        body: JSON.stringify(Object.fromEntries(new FormData(companyProfileForm))),
      });
      user.company_name = company.name;
      localStorage.setItem('hireloop_user', JSON.stringify(user));
      document.querySelector('#company-name').textContent = company.name;
      populateCompanyProfile(company);
      companyProfileFeedback.textContent = 'Company profile saved.';
      companyProfileFeedback.hidden = false;
      window.bootstrap.Modal.getInstance(companyProfileModal).hide();
    } catch (error) {
      companyProfileFeedback.textContent = error.message;
      companyProfileFeedback.hidden = false;
    }
  });
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

async function updateApplicationStatus(applicationId, status, button) {
  if (!applicationId) return;
  button?.setAttribute('disabled', '');
  try {
    await request(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    const application = applications.find((item) => String(item.id) === String(applicationId));
    if (application) application.status = status;
    render();
    notify('Application status updated.');
  } catch (error) {
    button?.removeAttribute('disabled');
    notify(error.message);
  }
}

document.querySelector('#admin-applications').addEventListener('click', (event) => {
  const button = event.target.closest('[data-next-status]');
  if (button) updateApplicationStatus(button.dataset.statusId, button.dataset.nextStatus, button);
});

document.querySelector('[data-application-filter="all"]').closest('[role="group"]').addEventListener('click', (event) => {
  const button = event.target.closest('[data-application-filter]');
  if (!button) return;
  applicationFilter = button.dataset.applicationFilter;
  document.querySelectorAll('[data-application-filter]').forEach((item) => item.classList.toggle('active', item === button));
  render();
});

document.querySelector('#refresh-applications').addEventListener('click', loadDashboard);

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
