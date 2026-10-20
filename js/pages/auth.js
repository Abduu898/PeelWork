const heading = document.querySelector('#auth-heading');
const description = document.querySelector('#auth-description');

document.querySelector('#authTab').addEventListener('shown.bs.tab', (event) => {
  const registering = event.target.id === 'register-tab';
  heading.textContent = registering ? 'Start with your work' : 'Welcome back';
  description.textContent = registering
    ? 'Build your candidate profile, one piece of evidence at a time.'
    : 'Your opportunities, applications, and proof portfolio in one place.';
  document.title = `JobBoard — ${registering ? 'Register' : 'Sign in'}`;
});

for (const control of document.querySelectorAll('[data-show-password]')) {
  control.addEventListener('change', () => {
    document.getElementById(control.dataset.showPassword).type = control.checked ? 'text' : 'password';
  });
}

for (const kind of ['login', 'register']) {
  const form = document.getElementById(`${kind}-form`);
  const feedback = document.getElementById(`${kind}-feedback`);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    feedback.hidden = false;
    feedback.textContent = kind === 'register'
      ? 'Registration form checked. This preview has not created an account or saved your password.'
      : 'Sign-in form checked. This preview has not signed you in or saved your password.';
    feedback.focus();
  });
  form.addEventListener('input', () => { feedback.hidden = true; });
}
