import { authHeaders, clearSession, getStoredUser, getToken } from '../services/auth.js';

const token = getToken();
const user = getStoredUser();
const feedback = document.querySelector('#super-feedback');

if (!token || user?.role !== 'super_admin') window.location.href = 'login.html';

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: authHeaders({ 'Content-Type': 'application/json', ...(options.headers || {}) }) });
  if (response.status === 401) {
    clearSession();
    window.location.href = 'login.html';
    return null;
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}

async function loadCompanies() {
  try {
    const companies = await request('/admin/companies');
    document.querySelector('#company-list').innerHTML = companies.map((company) => `<tr><td class="fw-bold">${escapeHtml(company.name)}</td><td>${escapeHtml(company.location || '—')}</td><td>${escapeHtml(company.description || '—')}</td></tr>`).join('');
  } catch (error) {
    feedback.textContent = error.message;
    feedback.hidden = false;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
}

document.querySelector('#admin-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await request('/admin/companies', {
      method: 'POST',
      body: JSON.stringify({
        company: {
          name: document.querySelector('#companyName').value.trim(),
          location: document.querySelector('#companyLocation').value.trim(),
          description: document.querySelector('#companyDescription').value.trim()
        },
        admin: {
          name: document.querySelector('#adminName').value.trim(),
          email: document.querySelector('#adminEmail').value.trim(),
          password: document.querySelector('#adminPassword').value
        }
      })
    });
    feedback.textContent = 'Company and admin created.';
    feedback.hidden = false;
    document.querySelector('#admin-form').reset();
    window.bootstrap.Modal.getInstance(document.querySelector('#adminModal')).hide();
    await loadCompanies();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.hidden = false;
  }
});

loadCompanies();
