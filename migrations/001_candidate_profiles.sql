USE hireloop;

ALTER TABLE people
  ADD COLUMN phone VARCHAR(30),
  ADD COLUMN location VARCHAR(150),
  ADD COLUMN headline VARCHAR(180),
  ADD COLUMN bio TEXT,
  ADD COLUMN skills TEXT,
  ADD COLUMN experience TEXT,
  ADD COLUMN education TEXT,
  ADD COLUMN portfolio_url VARCHAR(255),
  ADD COLUMN linkedin_url VARCHAR(255);

ALTER TABLE applications
  ADD COLUMN candidate_id INT NULL,
  ADD CONSTRAINT fk_applications_candidate
    FOREIGN KEY (candidate_id) REFERENCES people(id) ON DELETE SET NULL;

UPDATE applications
JOIN people ON people.email = applications.applicant_email AND people.role = 'candidate'
SET applications.candidate_id = people.id
WHERE applications.candidate_id IS NULL;
