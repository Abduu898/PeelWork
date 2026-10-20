// Fictional portfolio examples. Candidates can leave every proof unselected.
export const proofs = [
  { id: 'dashboard', title: 'React Dashboard', description: 'An accessible dashboard with reusable components and a REST API.', skills: ['React', 'JavaScript', 'REST APIs'] },
  { id: 'design', title: 'Product Design Case Study', description: 'Research notes, Figma screens, and an interactive product prototype.', skills: ['Figma', 'Prototyping', 'Accessibility'] },
  { id: 'containers', title: 'Containerized API', description: 'A Docker-based API with a continuous integration pipeline.', skills: ['Docker', 'CI/CD', 'Node.js'] },
];

// Submission-time example snapshots, separate from the editable portfolio.
export const sampleApplications = [
  { id: 1, job_id: 1, job_title: 'Full Stack Engineer', name: 'Alex Morgan', email: 'alex@example.com', message: 'I built an accessible React dashboard and would love to bring that experience to your product team.', status: 'New', proofs: [{ title: 'React Dashboard', description: 'Reusable React components connected to a REST API.', skills: ['React', 'JavaScript', 'REST APIs'] }] },
  { id: 2, job_id: 2, job_title: 'Product Designer', name: 'Sam Lee', email: 'sam@example.com', message: 'My product design case study shows how I turn research into accessible interactive prototypes.', status: 'In review', proofs: [{ title: 'Product Design Case Study', description: 'Research and Figma prototypes for an accessible product.', skills: ['Figma', 'Prototyping', 'Accessibility'] }] },
  { id: 3, job_id: 3, job_title: 'DevOps Engineer', name: 'Taylor Kim', email: 'taylor@example.com', message: 'I would like to discuss my experience with deployment automation and supporting engineering teams.', status: 'New', proofs: [] },
];
