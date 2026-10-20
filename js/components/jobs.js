// Database text is always escaped before being inserted into HTML.
export const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export function jobCard(job) {
  const text = escapeHTML;
  const id = encodeURIComponent(job.id);
  return `<div class="col"><article class="cartoon-card custom-card h-100 p-4 d-flex flex-column justify-content-between">
    <div><div class="d-flex justify-content-between align-items-start mb-3 gap-2">
      <div><h3 class="h5 fw-bold mb-1">${text(job.title)}</h3><p class="text-muted small fw-semibold mb-0">${text(job.company_name)}</p></div>
      <span class="custom-badge-yellow px-2 py-1 small">${text(job.contract_type)}</span>
    </div><p class="text-secondary small mb-4 fw-medium">${text(job.description.split('\n')[0])}</p></div>
    <div><div class="text-muted small mb-3 fw-medium">
      <div class="mb-1"><i class="bi bi-geo-alt-fill text-dark me-2" aria-hidden="true"></i>${text(job.location)}</div>
      <div><i class="bi bi-cash-stack text-dark me-2" aria-hidden="true"></i>${text(job.salary || 'Salary not specified')}</div>
    </div><a href="job-detail.html?id=${id}" data-job-id="${text(job.id)}" class="btn btn-cartoon-primary btn-yellow w-100 py-2" aria-controls="job-details" aria-expanded="false" aria-label="View ${text(job.title)} at ${text(job.company_name)}">View Job</a></div>
  </article></div>`;
}

export function jobDetails(job) {
  const text = escapeHTML;
  return `<div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
    <div><h2 class="h2 fw-bold mb-1" id="details-title">${text(job.title)}</h2><p class="fs-5 text-muted fw-semibold mb-0">${text(job.company_name)}</p></div>
    <span class="custom-badge-yellow px-3 py-1 fs-6">${text(job.contract_type)}</span></div>
    <div class="d-flex flex-wrap gap-3 text-dark fw-medium small border-top border-bottom border-2 border-dark py-3 my-4">
      <span><i class="bi bi-geo-alt-fill me-1" aria-hidden="true"></i>${text(job.location)}</span>
      <span><i class="bi bi-cash-stack me-1" aria-hidden="true"></i>${text(job.salary || 'Salary not specified')}</span>
      <span>${text(job.category_name)}</span>
    </div><h3 class="h5 fw-bold mb-3">About the Role</h3>
    <p class="text-secondary fw-medium job-description">${text(job.description)}</p>
    <h3 class="h5 fw-bold mt-4 mb-3">About the Company</h3>
    <p class="text-secondary fw-medium mb-0">${text(job.company_description || 'Company information will be added soon.')}</p>`;
}
