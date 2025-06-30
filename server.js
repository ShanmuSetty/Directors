const express = require('express');
const cors = require('cors');
const app = express();
const directors = require('./directors.json');

app.use(cors()); // allow frontend to access this

app.get('/api/directors', (req, res) => {
  res.json(directors.directors);
});

app.listen(3050, () => {
  console.log('Director API running at http://localhost:3050/api/directors');
});
