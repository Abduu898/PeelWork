const sessionUser = JSON.parse(localStorage.getItem('hireloop_user') || 'null');
const dashboardLink = sessionUser?.role === 'super_admin'
  ? 'super-admin.html'
  : sessionUser?.role === 'company_admin' ? 'admin.html' : 'login.html';
const dashboardLabel = sessionUser?.role === 'super_admin'
  ? 'Super admin'
  : sessionUser?.role === 'company_admin' ? 'Employer dashboard' : 'Sign in';
const navigation = `<nav class="navbar navbar-expand-lg sticky-top py-3">
    <div class="container">
      <a class="navbar-brand fw-extrabold fs-4 d-flex align-items-center gap-2" href="index.html">
        <span class="brand-logo-bg"><i class="bi bi-briefcase-fill"></i></span>
        <span class="fw-bold tracking-tight">JobBoard</span>
      </a>
      <button class="navbar-toggler border-2 border-dark" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center gap-2 mt-3 mt-lg-0">
          <li class="nav-item"><a class="nav-link fw-semibold text-dark active" href="index.html">Find Jobs</a></li>
          <li class="nav-item"><a class="nav-link fw-semibold text-dark" href="login.html">Login</a></li>
          <li class="nav-item ms-lg-2 w-100 w-lg-auto">
            <a class="btn btn-yellow px-4 w-100" href="${dashboardLink}">${dashboardLabel}</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;
const footer = `<footer class="bg-white border-top border-2 border-dark py-4 mt-auto">
    <div class="container text-center justify-content-md-between d-md-flex align-items-center">
      <p class="mb-2 mb-md-0 text-dark fw-medium small">&copy; 2026 JobBoard. All rights reserved.</p>
      <div>
        <a href="#" class="text-dark fw-semibold text-decoration-none small me-3">Privacy Policy</a>
        <a href="#" class="text-dark fw-semibold text-decoration-none small">Terms of Service</a>
      </div>
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
if (currentPage === 'index.html') {
  const notice = document.createElement('p');
  notice.className = 'small text-muted fw-medium mb-0';
  notice.textContent = 'Frontend preview · Fictional opportunities.';
  document.querySelector('main .container').append(notice);
}
