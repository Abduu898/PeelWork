import { escapeHTML as text } from '../components/jobs.js';

const token = localStorage.getItem('hireloop_session');
const user = JSON.parse(localStorage.getItem('hireloop_user') || 'null');
const feedback = document.querySelector('#dashboard-feedback');

if (!token || user?.role !== 'candidate') {
  window.location.href = 'login.html';
}

const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

function render(applications) {
  document.querySelector('#application-count').textContent = applications.length;
  document.querySelector('#review-count').textContent = applications.filter((application) => application.status === 'reviewed').length;
  document.querySelector('#next-step').textContent = applications[0] ? statusLabel(applications[0].status || 'pending') : 'Apply now';
  document.querySelector('#candidate-applications').innerHTML = applications.length
    ? applications.map((application) => `<article class="application-item p-3">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div><h3 class="h6 fw-bold mb-1">${text(application.job_title)}</h3><p class="small text-muted mb-0">${text(application.company_name || 'Company')}</p></div>
          <span class="status-badge" data-status="${text(application.status || 'pending')}">${text(statusLabel(application.status || 'pending'))}</span>
        </div>
        <p class="small job-description mt-3 mb-2">${text(application.message || 'No message provided.')}</p>
        <time class="small text-muted" datetime="${text(application.created_at)}">Applied ${new Date(application.created_at).toLocaleDateString()}</time>
      </article>`).join('')
    : '<div class="text-center py-4"><p class="fw-bold mb-2">No applications yet.</p><p class="small text-muted mb-3">Find a role that fits and send your first application.</p><a class="btn btn-yellow" href="index.html#opportunities">Browse opportunities</a></div>';
}

async function loadDashboard() {
  try {
    const response = await fetch('/me/applications', { headers: { Authorization: `Bearer ${token}` } });
    const applications = await response.json();
    if (!response.ok) throw new Error(applications.error || 'Applications could not be loaded.');
    document.querySelector('#candidate-name').textContent = user.name;
    document.querySelector('#candidate-email').textContent = user.email;
    render(applications);
  } catch (error) {
    feedback.textContent = error.message;
    feedback.hidden = false;
  }
}

loadDashboard();
