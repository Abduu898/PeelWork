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

-- Passwords stored for dev testing (admin user included)
INSERT INTO people (name, email, password, role) VALUES
('Admin User', 'admin@hireloop.com', 'admin123', 'admin'),
('Standard Candidate', 'user@hireloop.com', 'user123', 'user');