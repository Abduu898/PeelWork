DROP DATABASE IF EXISTS hireloop;
CREATE DATABASE hireloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hireloop;

CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150),
  description TEXT,
  website_url VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  remote_policy VARCHAR(100),
  benefits TEXT,
  linkedin_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(150),
  salary VARCHAR(100),
  contract_type VARCHAR(50),
  company_id INT,
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE people (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('candidate', 'company_admin', 'super_admin') NOT NULL DEFAULT 'candidate',
  company_id INT UNIQUE,
  phone VARCHAR(30),
  location VARCHAR(150),
  headline VARCHAR(180),
  bio TEXT,
  skills TEXT,
  experience TEXT,
  education TEXT,
  portfolio_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad_id INT NOT NULL,
  candidate_id INT,
  applicant_name VARCHAR(150) NOT NULL,
  applicant_email VARCHAR(150) NOT NULL,
  message TEXT,
  status ENUM('pending', 'reviewed', 'accepted', 'rejected') NOT NULL DEFAULT 'pending', /* restricts a column to only allow specific values */
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES people(id) ON DELETE SET NULL,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
);