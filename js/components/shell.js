import { dashboardFor, getStoredUser, logout } from '../services/auth.js';

const sessionUser = getStoredUser();
const dashboardLink = dashboardFor(sessionUser);
const dashboardLabel = sessionUser
  ? sessionUser.role === 'super_admin' ? 'Super admin'
    : sessionUser.role === 'company_admin' ? 'Employer dashboard' : 'My dashboard'
  : 'Sign in';
const navigation = `<nav class="navbar navbar-expand-lg sticky-top py-3">
    <div class="container">
      <a class="navbar-brand peelwork-brand fw-extrabold fs-4 d-flex align-items-center gap-2" href="index.html">
        <img class="peelwork-logo" src="assets/banana.png" alt="">
        <span class="peelwork-brand-name">PeelWork</span>
      </a>
      <button class="navbar-toggler border-2 border-dark" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center gap-2 mt-3 mt-lg-0">
          <li class="nav-item"><a class="nav-link fw-semibold text-dark" href="jobs.html">Find Jobs</a></li>
          ${sessionUser
    ? '<li class="nav-item"><button type="button" class="nav-link fw-semibold text-dark" id="logout-button">Log out</button></li>'
    : '<li class="nav-item"><a class="nav-link fw-semibold text-dark" href="login.html">Login</a></li>'}
          <li class="nav-item ms-lg-2 w-100 w-lg-auto">
            <a class="btn btn-yellow px-4 w-100" href="${dashboardLink}">${dashboardLabel}</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;
const footer = `<footer class="site-footer mt-auto">
    <div class="container py-5">
      <div class="row g-4">
        <div class="col-lg-5">
          <a class="footer-brand text-decoration-none" href="index.html"><img class="peelwork-logo" src="assets/banana.png" alt=""><span>PeelWork</span></a>
          <p class="small footer-muted mt-3 mb-0">The short route to good work and good people.</p>
        </div>
        <div class="col-6 col-lg-2"><h2 class="footer-heading">Explore</h2><a href="jobs.html">Find jobs</a><a href="login.html">Create account</a></div>
        <div class="col-6 col-lg-2"><h2 class="footer-heading">For teams</h2><a href="login.html">Hire with us</a><a href="login.html">Company login</a></div>
        <div class="col-lg-3"><h2 class="footer-heading">Say hello</h2><p class="small footer-muted">Questions, ideas, or just want to talk?</p><div class="d-flex gap-2"><a class="footer-social" href="https://github.com/Abduu898/PeelWork" aria-label="PeelWork on GitHub"><i class="bi bi-github"></i></a><a class="footer-social" href="mailto:hello@peelwork.local" aria-label="Email PeelWork"><i class="bi bi-envelope"></i></a></div></div>
      </div>
      <div class="footer-bottom mt-5 pt-3"><span class="small footer-muted">&copy; 2026 PeelWork. Take your time.</span><span class="small footer-muted">Made with care.</span></div>
    </div>
  </footer>`;
for (const [selector, markup] of [['#site-navigation', navigation], ['#site-footer', footer]]) {
  document.querySelector(selector).outerHTML = markup;
}
const currentPage = location.pathname.split('/').pop() || 'index.html';
for (const link of document.querySelectorAll('.navbar-nav a')) {
  const active = link.getAttribute('href') === currentPage;
  link.classList.toggle('active', active);
  if (active) link.setAttribute('aria-current', 'page');
}
const toggler = document.querySelector('.navbar-toggler');
toggler.setAttribute('aria-controls', 'navbarNav');
toggler.setAttribute('aria-expanded', 'false');
toggler.setAttribute('aria-label', 'Toggle navigation');
document.querySelector('#logout-button')?.addEventListener('click', async () => {
  const button = document.querySelector('#logout-button');
  button.disabled = true;
  await logout();
  window.location.href = 'index.html';
});
if (currentPage === 'index.html') {
  const notice = document.createElement('p');
  notice.className = 'small text-muted fw-medium mb-0';
  notice.textContent = 'Fresh roles, better matches.';
  document.querySelector('main .container').append(notice);
}
