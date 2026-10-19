-- 1. Insertion des catégories
INSERT INTO categories (name) VALUES 
('Software Engineering'), 
('UI/UX Design'), 
('DevOps');

-- 2. Insertion des entreprises
INSERT INTO companies (name, description) VALUES 
('TechCorp Studios', 'Studio de développement d\'applications web et mobiles à Paris.'),
('CloudScale Tech', 'Entreprise spécialisée dans les infrastructures Cloud et DevOps.');

-- 3. Insertion des annonces (Associées à une entreprise et une catégorie)
INSERT INTO ads (title, description, location, salary, contract_type, company_id, category_id) VALUES 
('Full Stack Engineer', 'Développement de tableaux de bord modernes avec React et Node.js.', 'Paris, France', '45k€ - 55k€', 'CDI', 1, 1),
('Product Designer', 'Création de composants UI/UX et de prototypes interactifs Figma.', 'Remote', '40k€ - 50k€', 'Remote', 1, 2),
('DevOps Engineer', 'Gestion des pipelines CI/CD, conteneurs Docker et Kubernetes.', 'Lyon, France', '500€ / jour', 'Freelance', 2, 3);

-- 4. Insertion des candidats
INSERT INTO people (full_name, email) VALUES 
('Abderrahim Bahraoui', 'abderrahim@example.com'),
('Sarah Martin', 'sarah.m@example.com'),
('Alexandre Dupont', 'alex.dupont@example.com');

-- 5. Insertion des candidatures (Liaison entre annonce et candidat avec message)
INSERT INTO applications (ad_id, person_id, message) VALUES 
(1, 1, 'Bonjour, je suis très intéressé par le poste Full Stack. Voici mon portfolio.'),
(1, 2, 'J\'ai 4 ans d\'expérience sur React et Node.js, je serais ravie d\'échanger.'),
(2, 3, 'Passionné par le design UI/UX et le prototypage Figma.');