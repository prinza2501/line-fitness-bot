require('dotenv').config();
const express = require('express');
const { createWebhookRouter } = require('./webhook');
const { startScheduler } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/webhook', express.raw({ type: 'application/json' }));
app.use('/webhook', createWebhookRouter());

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`);
  startScheduler();
});
