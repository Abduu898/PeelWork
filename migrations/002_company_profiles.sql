USE hireloop;

ALTER TABLE companies
  ADD COLUMN website_url VARCHAR(255),
  ADD COLUMN industry VARCHAR(100),
  ADD COLUMN company_size VARCHAR(50),
  ADD COLUMN remote_policy VARCHAR(100),
  ADD COLUMN benefits TEXT,
  ADD COLUMN linkedin_url VARCHAR(255);
