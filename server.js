const express = require('express');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');

const app = express();
const sessions = new Map();
const PORT = 3000;

app.use(express.json()); /* turns json to js */ 
app.use(express.static(__dirname)); /*so html css can work in browser*/ 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200); /* browser preflight request to verify permissions */
  next();
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
/* imports and setup */ 

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
function createSession(user) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, user); /* returns a new session token back to the user*/
  return token;
}
function requireAuth(req, res, next) { /*checks wether the user is authenticated*/
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const user = token ? sessions.get(token) : null;
  if (!user) return res.status(401).json({ error: 'Authentication required.' }); /*if no return 401 */
  req.user = user;
  next();
}

function attachSessionUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  req.user = token ? sessions.get(token) || null : null;
  next();
}

function requireRole(...roles) { /*checks if the user has the required role*/
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission for this action.' });
    next();
  };
}

/* Security and authentication functions */

const jobQuery = ` 
  SELECT ads.*, companies.name AS company_name, companies.description AS company_description,
         categories.name AS category_name
  FROM ads
  LEFT JOIN companies ON companies.id = ads.company_id
  LEFT JOIN categories ON categories.id = ads.category_id
`;

// Public job board
app.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/ads', async (req, res) => {
  try {
    const [rows] = await db.query(`${jobQuery} ORDER BY ads.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/ads/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`${jobQuery} WHERE ads.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Ad not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/ads/:id/applications', attachSessionUser, async (req, res) => {
  try {
    const { first_name, last_name, email, message } = req.body;
    if (req.user && req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidate accounts can submit applications.' });
    }
    const applicantName = req.user?.role === 'candidate' ? req.user.name : (last_name ? `${first_name} ${last_name}` : first_name);
    const applicantEmail = req.user?.role === 'candidate' ? req.user.email : email;
    if (!applicantName || !applicantEmail) return res.status(400).json({ error: 'First name and email are required.' });
    const [result] = await db.query(
      'INSERT INTO applications (ad_id, candidate_id, applicant_name, applicant_email, message) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, req.user?.role === 'candidate' ? req.user.id : null, applicantName, applicantEmail, message || null]
    );
    res.status(201).json({ message: 'Application submitted successfully!', application_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/me/profile', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, location, headline, bio, skills, experience,
              education, portfolio_url, linkedin_url
       FROM people WHERE id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Candidate profile not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/me/profile', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const { name, phone, location, headline, bio, skills, experience, education, portfolio_url, linkedin_url } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    const [result] = await db.query(
      `UPDATE people
       SET name = ?, phone = ?, location = ?, headline = ?, bio = ?, skills = ?,
           experience = ?, education = ?, portfolio_url = ?, linkedin_url = ?
       WHERE id = ?`,
      [
        name.trim(), phone?.trim() || null, location?.trim() || null, headline?.trim() || null,
        bio?.trim() || null, skills?.trim() || null, experience?.trim() || null,
        education?.trim() || null, portfolio_url?.trim() || null, linkedin_url?.trim() || null,
        req.user.id,
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Candidate profile not found.' });
    const [rows] = await db.query(
      'SELECT id, name, email, phone, location, headline, bio, skills, experience, education, portfolio_url, linkedin_url FROM people WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/auth/register/candidate', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    const [result] = await db.query(
      'INSERT INTO people (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashPassword(password), 'candidate']
    );
    res.status(201).json({ message: 'Candidate account created.', user_id: result.insertId, role: 'candidate' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That email is already registered.' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const [rows] = await db.query(
      'SELECT id, name, email, role, company_id FROM people WHERE email = ? AND password = ?',
      [email, hashPassword(password)]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password.' });
    const user = rows[0];
    res.json({ message: 'Login successful.', token: createSession(user), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/auth/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  sessions.delete(token);
  res.json({ message: 'Logged out.' });
});

app.get('/me/applications', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT applications.id, applications.applicant_name, applications.applicant_email,
              applications.message, applications.status, applications.created_at,
              ads.title AS job_title, companies.name AS company_name
       FROM applications
       JOIN ads ON ads.id = applications.ad_id
       LEFT JOIN companies ON companies.id = ads.company_id
       WHERE applications.candidate_id = ? OR (applications.candidate_id IS NULL AND applications.applicant_email = ?)
       ORDER BY applications.created_at DESC`,
      [req.user.id, req.user.email]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* end of candidate and guest routes */ 

// Company admin routes: ownership always comes from the session.
app.get('/company/profile', requireAuth, requireRole('company_admin'), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM companies WHERE id = ?', [req.user.company_id]);
  if (!rows.length) return res.status(404).json({ error: 'Company not found.' });
  res.json(rows[0]);
});

app.put('/company/profile', requireAuth, requireRole('company_admin'), async (req, res) => {
  try {
    const { name, location, description, website_url, industry, company_size, remote_policy, benefits, linkedin_url } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Company name is required.' });
    const [result] = await db.query(
      `UPDATE companies
       SET name = ?, location = ?, description = ?, website_url = ?, industry = ?,
           company_size = ?, remote_policy = ?, benefits = ?, linkedin_url = ?
       WHERE id = ?`,
      [
        name.trim(), location?.trim() || null, description?.trim() || null,
        website_url?.trim() || null, industry?.trim() || null, company_size?.trim() || null,
        remote_policy?.trim() || null, benefits?.trim() || null, linkedin_url?.trim() || null,
        req.user.company_id,
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Company not found.' });
    const [rows] = await db.query('SELECT * FROM companies WHERE id = ?', [req.user.company_id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/company/ads', requireAuth, requireRole('company_admin'), async (req, res) => {
  const [rows] = await db.query(`${jobQuery} WHERE ads.company_id = ? ORDER BY ads.created_at DESC`, [req.user.company_id]);
  res.json(rows);
});

app.get('/company/applications', requireAuth, requireRole('company_admin'), async (req, res) => {
  const [rows] = await db.query(
    `SELECT applications.*, ads.title AS job_title,
            people.phone, people.location, people.headline, people.bio, people.skills,
            people.experience, people.education, people.portfolio_url, people.linkedin_url
     FROM applications JOIN ads ON ads.id = applications.ad_id
     LEFT JOIN people ON people.id = applications.candidate_id
     WHERE ads.company_id = ? ORDER BY applications.created_at DESC`,
    [req.user.company_id]
  );
  res.json(rows);
});

app.patch('/applications/:id/status', requireAuth, requireRole('company_admin', 'super_admin'), async (req, res) => {
  const allowedStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
  const { status } = req.body;
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be pending, reviewed, accepted, or rejected.' });
  }

  try {
    const [result] = req.user.role === 'super_admin'
      ? await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id])
      : await db.query(
        `UPDATE applications
         JOIN ads ON ads.id = applications.ad_id
         SET applications.status = ?
         WHERE applications.id = ? AND ads.company_id = ?`,
        [status, req.params.id, req.user.company_id]
      );
    if (!result.affectedRows) return res.status(404).json({ error: 'Application not found for your company.' });
    res.json({ message: 'Application status updated.', status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/company/ads', requireAuth, requireRole('company_admin'), async (req, res) => {
  try {
    const { title, description, location, salary, contract_type, category_id } = req.body;
    if (!title || !description || !location || !contract_type || !category_id) {
      return res.status(400).json({ error: 'Title, description, location, contract type, and category are required.' });
    }
    const [result] = await db.query(
      'INSERT INTO ads (title, description, location, salary, contract_type, company_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, salary || null, contract_type, req.user.company_id, category_id]
    );
    res.status(201).json({ ad_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/company/ads/:id', requireAuth, requireRole('company_admin'), async (req, res) => {
  try {
    const { title, description, location, salary, contract_type, category_id } = req.body;
    const [result] = await db.query(
      `UPDATE ads SET title = ?, description = ?, location = ?, salary = ?, contract_type = ?, category_id = ?
       WHERE id = ? AND company_id = ?`,
      [title, description, location, salary || null, contract_type, category_id, req.params.id, req.user.company_id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Listing not found for your company.' });
    res.json({ message: 'Listing updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/company/ads/:id', requireAuth, requireRole('company_admin'), async (req, res) => {
  const [result] = await db.query('DELETE FROM ads WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Listing not found for your company.' });
  res.json({ message: 'Listing deleted.' });
});

// Super-admin routes
app.get('/admin/companies', requireAuth, requireRole('super_admin'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM companies ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/companies', requireAuth, requireRole('super_admin'), async (req, res) => {
  const { company, admin } = req.body;
  if (!company?.name?.trim() || !admin?.name?.trim() || !admin?.email?.trim() || !admin?.password) {
    return res.status(400).json({ error: 'Company name, admin name, email, and password are required.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [companyResult] = await connection.query(
      'INSERT INTO companies (name, location, description) VALUES (?, ?, ?)',
      [company.name.trim(), company.location?.trim() || null, company.description?.trim() || null]
    );
    const [adminResult] = await connection.query(
      'INSERT INTO people (name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?)',
      [admin.name.trim(), admin.email.trim(), hashPassword(admin.password), 'company_admin', companyResult.insertId]
    );
    await connection.commit();
    res.status(201).json({ company_id: companyResult.insertId, user_id: adminResult.insertId });
  } catch (err) {
    if (connection) await connection.rollback();
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This email is already registered.' });
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/admin/ads', requireAuth, requireRole('super_admin'), async (req, res) => {
  const [rows] = await db.query(`${jobQuery} ORDER BY ads.created_at DESC`);
  res.json(rows);
});

app.put('/admin/ads/:id', requireAuth, requireRole('super_admin'), async (req, res) => {
  const { title, description, location, salary, contract_type, company_id, category_id } = req.body;
  const [result] = await db.query(
    `UPDATE ads SET title = ?, description = ?, location = ?, salary = ?, contract_type = ?, company_id = ?, category_id = ? WHERE id = ?`,
    [title, description, location, salary || null, contract_type, company_id, category_id, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Listing not found.' });
  res.json({ message: 'Listing updated.' });
});

app.delete('/admin/ads/:id', requireAuth, requireRole('super_admin'), async (req, res) => {
  const [result] = await db.query('DELETE FROM ads WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Listing not found.' });
  res.json({ message: 'Listing deleted.' });
});

app.listen(PORT, () => {
  console.log(`PeelWork API running on http://localhost:${PORT}`);
});
