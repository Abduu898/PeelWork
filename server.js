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

// Port d'écoute du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`HireLoop REST API running on http://localhost:${PORT}`);
});