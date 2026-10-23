const heading = document.querySelector('#auth-heading');
const description = document.querySelector('#auth-description');

document.querySelector('#authTab').addEventListener('shown.bs.tab', (event) => {
  const registering = event.target.id === 'register-tab';
  heading.textContent = registering ? 'Start with your work' : 'Welcome back';
  description.textContent = registering
    ? 'Create your candidate account and start applying.'
    : 'Your opportunities and applications in one place.';
  document.title = `PeelWork — ${registering ? 'Register' : 'Sign in'}`;
});

for (const [controlId, passwordId] of [['show-login-password', 'loginPassword'], ['show-register-password', 'regPassword']]) {
  const control = document.getElementById(controlId);
  control.addEventListener('change', () => {
    document.getElementById(passwordId).type = control.checked ? 'text' : 'password';
  });
}

for (const kind of ['login', 'register']) {
  const form = document.getElementById(`${kind}-form`);
  const feedback = document.getElementById(`${kind}-feedback`);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = kind === 'register'
      ? { name: document.querySelector('#regName').value.trim(), email: document.querySelector('#regEmail').value.trim(), password: document.querySelector('#regPassword').value }
      : { email: document.querySelector('#loginEmail').value.trim(), password: document.querySelector('#loginPassword').value };
    const endpoint = kind === 'register' ? '/auth/register/candidate' : '/auth/login';
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request failed.');
      if (kind === 'login') {
        saveSession(result.token, result.user);
        window.location.href = dashboardFor(result.user);
      } else {
        feedback.textContent = 'Candidate account created. You can now sign in.';
      }
      feedback.hidden = false;
      feedback.focus();
    } catch (error) {
      feedback.hidden = false;
      feedback.textContent = error.message;
      feedback.focus();
    }
  });
  form.addEventListener('input', () => { feedback.hidden = true; });
}
import { dashboardFor, saveSession } from '../services/auth.js';
