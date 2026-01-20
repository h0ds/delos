const express = require('express');
const router = express.Router();
const { acquireSignals } = require('../services/signalAggregator');

router.get('/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const signals = await acquireSignals(query);
    res.json({
      query,
      timestamp: new Date().toISOString(),
      signals
    });
  } catch (error) {
    console.error('Signal acquisition error:', error);
    res.status(500).json({ error: 'Signal acquisition failed' });
  }
});

module.exports = router;
