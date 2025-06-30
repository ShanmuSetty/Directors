const express = require('express');
const cors = require('cors');
const app = express();
const directors = require('./directors.json');

app.use(cors()); // allow frontend to access this

app.get('/api/directors', (req, res) => {
  res.json(directors.directors);
});

const PORT = process.env.PORT || 3050;

app.listen(PORT, () => {
  console.log(`Director API running at http://localhost:${PORT}/api/directors`);
});

