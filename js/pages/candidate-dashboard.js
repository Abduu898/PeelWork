import { escapeHTML as text } from '../components/jobs.js';
import { authHeaders, clearSession, getStoredUser, getToken } from '../services/auth.js';

const token = getToken();
const user = getStoredUser();
const feedback = document.querySelector('#dashboard-feedback');
const profileForm = document.querySelector('#profile-form');
const profileFeedback = document.querySelector('#profile-feedback');

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
    const headers = authHeaders();
    const [profileResponse, applicationsResponse] = await Promise.all([
      fetch('/me/profile', { headers }),
      fetch('/me/applications', { headers }),
    ]);
    const profile = await profileResponse.json();
    const applications = await applicationsResponse.json();
    if (profileResponse.status === 401 || applicationsResponse.status === 401) {
      clearSession();
      window.location.href = 'login.html';
      return;
    }
    if (!profileResponse.ok) throw new Error(profile.error || 'Profile could not be loaded.');
    if (!applicationsResponse.ok) throw new Error(applications.error || 'Applications could not be loaded.');
    document.querySelector('#candidate-name').textContent = profile.name;
    document.querySelector('#candidate-email').textContent = profile.email;
    for (const [name, value] of Object.entries(profile)) {
      const field = profileForm.elements[name];
      if (field) field.value = value || '';
    }
    localStorage.setItem('hireloop_user', JSON.stringify({ ...user, name: profile.name }));
    render(applications);
  } catch (error) {
    feedback.textContent = error.message;
    feedback.hidden = false;
  }
}

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  profileFeedback.hidden = true;
  try {
    const response = await fetch('/me/profile', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(Object.fromEntries(new FormData(profileForm))),
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('The API server returned an HTML page. Start the app with "npm start", then try again.');
    }
    const profile = await response.json();
    if (!response.ok) throw new Error(profile.error || 'Profile could not be saved.');
    document.querySelector('#candidate-name').textContent = profile.name;
    localStorage.setItem('hireloop_user', JSON.stringify({ ...user, name: profile.name }));
    profileFeedback.textContent = 'Your profile has been saved.';
    profileFeedback.hidden = false;
  } catch (error) {
    profileFeedback.textContent = error.message;
    profileFeedback.hidden = false;
  }
});

loadDashboard();
