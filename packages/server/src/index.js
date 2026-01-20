require('dotenv').config();
const express = require('express');
const cors = require('cors');
const signalsRouter = require('./routes/signals');

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.use('/api/signals', signalsRouter);

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'operational',
    version: '1.0.0',
    sources: ['newsapi', 'google-news', 'reddit']
  });
});

app.listen(PORT, () => {
  console.log(`[sigint] server running on port ${PORT}`);
});
