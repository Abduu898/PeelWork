import { getJob } from '../services/jobs.js';
import { jobDetails } from '../components/jobs.js';
import { initApplication } from './application.js';

const content = document.querySelector('#job-page-content');
const id = new URLSearchParams(location.search).get('id');
const setMeta = (selector, attribute, value) => {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
};
if (!id || !/^\d+$/.test(id)) {
  content.textContent = 'Choose a job from the board to see its details.';
} else {
  getJob(id).then((job) => {
    const description = `${job.title} at ${job.company_name}. ${job.description}`.slice(0, 155);
    const canonicalUrl = new URL(`/job-detail.html?id=${encodeURIComponent(job.id)}`, location.origin).href;
    document.title = `${job.title} at ${job.company_name} — PeelWork`;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);
    setMeta('meta[property="og:title"]', 'content', document.title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    const structuredData = document.createElement('script');
    structuredData.type = 'application/ld+json';
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.created_at ? new Date(job.created_at).toISOString().slice(0, 10) : undefined,
      employmentType: job.contract_type,
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company_name,
        description: job.company_description || undefined,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
        },
      },
      url: canonicalUrl,
    });
    document.head.append(structuredData);
    content.innerHTML = jobDetails(job);
    // This page has one primary heading, unlike the inline board panel.
    const title = content.querySelector('#details-title');
    const heading = document.createElement('h1');
    heading.className = title.className;
    heading.textContent = title.textContent;
    title.replaceWith(heading);
    for (const subheading of content.querySelectorAll('h3')) {
      const sectionHeading = document.createElement('h2');
      sectionHeading.className = subheading.className;
      sectionHeading.textContent = subheading.textContent;
      subheading.replaceWith(sectionHeading);
    }
    initApplication(job);
  }).catch((error) => { content.textContent = error.message; });
}
