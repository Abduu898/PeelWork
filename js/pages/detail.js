import { getJob } from '../services/jobs.js';
import { jobDetails } from '../components/jobs.js';
import { initApplication } from './application.js';

const content = document.querySelector('#job-page-content');
const id = new URLSearchParams(location.search).get('id');
if (!id || !/^\d+$/.test(id)) {
  content.textContent = 'Choose a job from the board to see its details.';
} else {
  getJob(id).then((job) => {
    document.title = `${job.title} — JobBoard`;
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
