const token = localStorage.getItem('hireloop_session');
const user = JSON.parse(localStorage.getItem('hireloop_user') || 'null');
const feedback = document.querySelector('#super-feedback');

if (!token || user?.role !== 'super_admin') window.location.href = 'login.html';

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}

async function loadCompanies() {
  try {
    const companies = await request('/admin/companies');
    document.querySelector('#company-list').innerHTML = companies.map((company) => `<tr><td class="fw-bold">${company.name}</td><td>${company.location || '—'}</td><td>${company.description || '—'}</td></tr>`).join('');
  } catch (error) {
    feedback.textContent = error.message;
    feedback.hidden = false;
  }
}

document.querySelector('#admin-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await request('/admin/company-admins', {
      method: 'POST',
      body: JSON.stringify({
        name: document.querySelector('#adminName').value.trim(),
        email: document.querySelector('#adminEmail').value.trim(),
        password: document.querySelector('#adminPassword').value,
        company_id: Number(document.querySelector('#adminCompany').value)
      })
    });
    feedback.textContent = 'Company admin created.';
    feedback.hidden = false;
    window.bootstrap.Modal.getInstance(document.querySelector('#adminModal')).hide();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.hidden = false;
  }
});

loadCompanies();
