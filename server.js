const express = require('express');
const db = require('./db'); // Import db.js for connection

const app = express();

// helps the app tp read json datas sent from the client 
app.use(express.json());

// Autoriser le Front-end HTML/JS à contacter notre API sans blocage CORS - allow different ports to communicate
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
/*Route 1*/
app.get('/ads', async (req, res) => {
  try {
    // 1. Query all job advertisements from the database
    const [rows] = await db.query('SELECT * FROM ads');
    
    // 2. Return the list of ads as JSON 
    res.status(200).json(rows);
  } catch (err) {
    // 3. Return HTTP 500 if a database error occurs
    res.status(500).json({ error: err.message });
  }
});
/*Route 2*/
app.get('/ads/:id', async (req, res) => {
  try {
    // 1. On récupère l'ID envoyé dans l'URL (ex: /ads/1 -> adId vaut 1)
    const adId = req.params.id;

    // ask sql for the same ad
    const [rows] = await db.query('SELECT * FROM ads WHERE id = ?', [adId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    // 4. Si elle existe, on renvoie uniquement l'objet de l'annonce (le premier élément)
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Port d'écoute du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`HireLoop REST API running on http://localhost:${PORT}`);
});