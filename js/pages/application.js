import { escapeHTML as text } from '../components/jobs.js';

export function initApplication(job) {
  const form = document.querySelector('#application-form');
  const review = document.querySelector('#application-review');
  const file = document.querySelector('#resume');
  const sessionToken = localStorage.getItem('hireloop_session');
  const signedInUser = JSON.parse(localStorage.getItem('hireloop_user') || 'null');
  document.querySelector('#application-studio').hidden = false;
  document.querySelector('#start-application').hidden = false;
  document.querySelector('#application-fields').disabled = false;
  document.querySelector('#application-role').textContent = `${job.title} · ${job.company_name}`;
  document.querySelector('#role-requirements').innerHTML = (job.required_skills || []).map((skill) => `<span class="custom-badge-yellow small px-2 py-1">${text(skill)}</span>`).join('');
  if (signedInUser?.role === 'candidate') {
    document.querySelector('#fullName').value = signedInUser.name || '';
    document.querySelector('#email').value = signedInUser.email || '';
    document.querySelector('#application-mode').textContent = 'Signed-in candidate';
    document.querySelector('#application-intro').textContent = 'Your application will be submitted using your candidate account and will appear in your dashboard.';
  } else if (signedInUser) {
    document.querySelector('#application-mode').textContent = 'Candidate account required';
    document.querySelector('#application-intro').textContent = 'Only candidate accounts can submit applications. Sign out and log in with a candidate account to continue.';
    document.querySelector('#application-fields').disabled = true;
    form.querySelector('button[type="submit"]').disabled = true;
  }
  file.addEventListener('change', () => {
    const selected = file.files[0];
    const error = selected && (!/\.pdf$/i.test(selected.name) || selected.size > 5 * 1024 * 1024)
      ? 'Choose a PDF file up to 5 MB, or leave this optional field empty.' : '';
    file.setCustomValidity(error);
    if (error) file.reportValidity();
  });
  form.addEventListener('input', (event) => {
    if (event.target !== file) event.target.setCustomValidity?.('');
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    for (const id of ['fullName', 'message']) {
      const input = document.getElementById(id);
      if (!input.value.trim()) { input.setCustomValidity('Please enter a value.'); input.reportValidity(); return; }
    }
    const values = new FormData(form);
    const fullName = values.get('fullName').trim().split(/\s+/);
    try {
      const response = await fetch(`/ads/${encodeURIComponent(job.id)}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
        },
        body: JSON.stringify({
          first_name: fullName.shift(),
          last_name: fullName.join(' '),
          email: values.get('email').trim(),
          message: values.get('message').trim()
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The application could not be submitted.');
      document.querySelector('#application-summary').innerHTML = `
        <p class="fw-bold text-success"><i class="bi bi-check-circle-fill me-1" aria-hidden="true"></i>Application submitted successfully.</p>
        <p class="small text-muted">The company can now review your application${signedInUser?.role === 'candidate' ? ' from your candidate dashboard' : ''}.</p>
        <dl class="row small"><dt class="col-sm-3">Full name</dt><dd class="col-sm-9">${text(values.get('fullName').trim())}</dd><dt class="col-sm-3">Email</dt><dd class="col-sm-9 text-break">${text(values.get('email'))}</dd><dt class="col-sm-3">Phone</dt><dd class="col-sm-9">${text(values.get('phone') || 'Not provided')}</dd><dt class="col-sm-3">Resume</dt><dd class="col-sm-9 text-break">${text(file.files[0]?.name || 'Not attached')}</dd></dl>
        <h4 class="h6 fw-bold">Your message</h4><p class="small job-description">${text(values.get('message').trim())}</p>`;
      form.hidden = true;
      review.hidden = false;
      document.querySelector('#review-heading').focus();
      review.scrollIntoView({ block: 'start', behavior: 'instant' });
    } catch (error) {
      document.querySelector('#application-summary').textContent = error.message || 'The application could not be submitted.';
      review.hidden = false;
    }
  });
  document.querySelector('#edit-application').addEventListener('click', () => {
    review.hidden = true;
    form.hidden = false;
    document.querySelector('#fullName').focus();
  });
  if (location.hash === '#application-studio') {
    document.querySelector('#application-studio').scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}
