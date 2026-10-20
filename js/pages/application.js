import { proofs } from '../data/proofs.js';
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
  document.querySelector('#proof-options').innerHTML = proofs.map((proof) => `<div class="col-md-4"><label class="proof-option border border-2 border-dark rounded-3 p-3 h-100 d-block" for="proof-${proof.id}">
    <span class="d-flex align-items-start gap-2 mb-2"><input class="form-check-input border-2 border-dark flex-shrink-0" type="checkbox" name="proof" id="proof-${proof.id}" value="${proof.id}"><span class="fw-bold small">${text(proof.title)}</span></span>
    <span class="small text-secondary d-block mb-2">${text(proof.description)}</span><span class="small text-muted d-block">${proof.skills.map(text).join(' · ')}</span>
  </label></div>`).join('');

  const selectedProofs = () => {
    const selected = new Set(new FormData(form).getAll('proof'));
    return proofs.filter((proof) => selected.has(proof.id));
  };
  form.addEventListener('change', () => {
    const count = selectedProofs().length;
    document.querySelector('#proof-count').textContent = `${count} ${count === 1 ? 'proof' : 'proofs'} selected`;
  });
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
    const pack = selectedProofs();
    document.querySelector('#application-summary').innerHTML = `
      <p class="fw-bold">${text(job.title)} · ${text(job.company_name)}</p>
      <dl class="row small"><dt class="col-sm-3">Full name</dt><dd class="col-sm-9">${text(values.get('fullName').trim())}</dd><dt class="col-sm-3">Email</dt><dd class="col-sm-9 text-break">${text(values.get('email'))}</dd><dt class="col-sm-3">Phone</dt><dd class="col-sm-9">${text(values.get('phone') || 'Not provided')}</dd><dt class="col-sm-3">Resume</dt><dd class="col-sm-9 text-break">${text(file.files[0]?.name || 'Not attached')}</dd></dl>
      <h4 class="h6 fw-bold">Your message</h4><p class="small job-description">${text(values.get('message').trim())}</p>
      <h4 class="h6 fw-bold">Your Proof Pack · ${pack.length} selected</h4>
      ${pack.length ? `<ul class="small">${pack.map((proof) => `<li>${text(proof.title)} — ${proof.skills.map(text).join(', ')}</li>`).join('')}</ul>` : '<p class="small text-muted">No proofs attached. A portfolio is optional.</p>'}`;
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
