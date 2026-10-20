import { escapeHTML as text } from '../components/jobs.js';

export function initApplication(job) {
  const form = document.querySelector('#application-form');
  const review = document.querySelector('#application-review');
  const file = document.querySelector('#resume');
  document.querySelector('#application-studio').hidden = false;
  document.querySelector('#start-application').hidden = false;
  document.querySelector('#application-fields').disabled = false;
  document.querySelector('#application-role').textContent = `${job.title} · ${job.company_name}`;
  document.querySelector('#role-requirements').innerHTML = (job.required_skills || []).map((skill) => `<span class="custom-badge-yellow small px-2 py-1">${text(skill)}</span>`).join('');
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
    const response = await fetch(`/ads/${encodeURIComponent(job.id)}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: fullName.shift(),
        last_name: fullName.join(' '),
        email: values.get('email').trim(),
        message: values.get('message').trim()
      })
    });
    const result = await response.json();
    if (!response.ok) {
      document.querySelector('#application-summary').textContent = result.error || 'The application could not be submitted.';
      review.hidden = false;
      return;
    }
    document.querySelector('#application-summary').innerHTML = `
      <p class="fw-bold">${text(job.title)} · ${text(job.company_name)}</p>
      <dl class="row small"><dt class="col-sm-3">Full name</dt><dd class="col-sm-9">${text(values.get('fullName').trim())}</dd><dt class="col-sm-3">Email</dt><dd class="col-sm-9 text-break">${text(values.get('email'))}</dd><dt class="col-sm-3">Phone</dt><dd class="col-sm-9">${text(values.get('phone') || 'Not provided')}</dd><dt class="col-sm-3">Resume</dt><dd class="col-sm-9 text-break">${text(file.files[0]?.name || 'Not attached')}</dd></dl>
      <h4 class="h6 fw-bold">Your message</h4><p class="small job-description">${text(values.get('message').trim())}</p>`;
    form.hidden = true;
    review.hidden = false;
    document.querySelector('#review-heading').focus();
    review.scrollIntoView({ block: 'start', behavior: 'instant' });
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
