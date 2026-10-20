USE hireloop;

INSERT INTO companies (id, name, location, description) VALUES
(1, 'TechCorp Paris', 'Paris, France', 'Leading enterprise software solution provider.'),
(2, 'DesignStudio', 'Remote', 'Creative agency specializing in digital product experiences.');

INSERT INTO categories (id, name) VALUES
(1, 'Engineering'),
(2, 'Design'),
(3, 'DevOps');

INSERT INTO ads (title, description, location, salary, contract_type, company_id, category_id) VALUES
('Full Stack Engineer', 'Développement de tableaux de bord modernes avec React et Node.js.', 'Paris, France', '45k€ - 55k€', 'CDI', 1, 1),
('Product Designer', 'Création de composants UI/UX et de prototypes interactifs Figma.', 'Remote', '40k€ - 50k€', 'Remote', 2, 2),
('DevOps Engineer', 'Gestion des pipelines CI/CD, conteneurs Docker et Kubernetes.', 'Lyon, France', '500€ / jour', 'Freelance', 1, 3);

-- Passwords are SHA-256 hashes for this school-project seed data.
INSERT INTO people (name, email, password, role, company_id) VALUES
('Super Admin', 'admin@hireloop.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'super_admin', NULL),
('TechCorp Admin', 'techcorp@hireloop.com', '54e48cbd75ad8c2d3237b35a151ca891de8ebd4ec6d2a958a51121e074c1ba51', 'company_admin', 1),
('DesignStudio Admin', 'designstudio@hireloop.com', '54e48cbd75ad8c2d3237b35a151ca891de8ebd4ec6d2a958a51121e074c1ba51', 'company_admin', 2),
('Standard Candidate', 'user@hireloop.com', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', 'candidate', NULL);