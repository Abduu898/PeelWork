const express = require('express');
const db = require('./db');

const app = express();

// Parse JSON request bodies
app.use(express.json());

// CORS configuration for front-end integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =============================================================
// SECTION 1: PUBLIC JOB BOARD ROUTES
// =============================================================

// Route 1: GET /ads (Fetch all job listings)
app.get('/ads', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ads');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 2: GET /ads/:id (Fetch single job details for "Learn More")
app.get('/ads/:id', async (req, res) => {
  try {
    const adId = req.params.id;
    const [rows] = await db.query('SELECT * FROM ads WHERE id = ?', [adId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 3: POST /ads/:id/applications (Submit a job application for "Apply")
app.post('/ads/:id/applications', async (req, res) => {
  try {
    const adId = req.params.id;
    const { first_name, last_name, email, message } = req.body;

    if (!first_name || !email) {
      return res.status(400).json({ error: 'First name and email are required.' });
    }

    const fullName = last_name ? `${first_name} ${last_name}` : first_name;

    const [result] = await db.query(
      'INSERT INTO applications (ad_id, applicant_name, applicant_email, message) VALUES (?, ?, ?, ?)',
      [adId, fullName, email, message || null]
    );

    res.status(201).json({
      message: 'Application submitted successfully!',
      application_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// SECTION 2: AUTHENTICATION ROUTES
// =============================================================

// Route 4: POST /register (Create a new account)
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const userRole = role || 'user';

    const [result] = await db.query(
      'INSERT INTO people (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, userRole]
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user_id: result.insertId,
      role: userRole
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 5: POST /login (User sign in)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await db.query(
      'SELECT id, name, email, role FROM people WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json({
      message: 'Login successful!',
      user: rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// SECTION 3: ADMIN CRUD MANAGEMENT ROUTES
// =============================================================

// Route 6: POST /ads (Create a new job posting)
app.post('/ads', async (req, res) => {
  try {
    const { title, description, location, salary, contract_type, company_id, category_id } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO ads (title, description, location, salary, contract_type, company_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, location || null, salary || null, contract_type || null, company_id || 1, category_id || 1]
    );

    res.status(201).json({
      message: 'Job advertisement created successfully!',
      ad_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 7: PUT /ads/:id (Update an existing job posting)
app.put('/ads/:id', async (req, res) => {
  try {
    const adId = req.params.id;
    const { title, description, location, salary, contract_type } = req.body;

    const [result] = await db.query(
      'UPDATE ads SET title = ?, description = ?, location = ?, salary = ?, contract_type = ? WHERE id = ?',
      [title, description, location, salary, contract_type, adId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ad not found or no changes made.' });
    }

    res.status(200).json({ message: 'Job advertisement updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 8: DELETE /ads/:id (Delete a job posting)
app.delete('/ads/:id', async (req, res) => {
  try {
    const adId = req.params.id;

    const [result] = await db.query('DELETE FROM ads WHERE id = ?', [adId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    res.status(200).json({ message: 'Job advertisement deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server listener
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`HireLoop REST API running on http://localhost:${PORT}`);
});