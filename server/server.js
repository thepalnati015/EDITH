
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const OpenAI = require('openai');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test whether the backend is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'TaskPilot backend is running!',
  });
});

// Analyse customer complaints
// Analyse customer complaints - FREE DEMO MODE
app.post('/api/ai/analyze-complaint', (req, res) => {
  const { complaint } = req.body;

  if (!complaint || !complaint.trim()) {
    return res.status(400).json({ error: 'Complaint is required.' });
  }

  const text = complaint.toLowerCase();

  let category = 'General Support';
  let priority = 'Medium';
  let summary = 'Customer has raised a concern requiring review.';
  let recommendedAction = 'Review the complaint and contact the customer with an update.';

 if (text.includes('delivery') || text.includes('order') || text.includes('shipping') || text.includes('arrived')) {
  category = 'Order and Delivery';
  recommendedAction = 'Check the order tracking details and provide the customer with an updated delivery estimate.';
} else if (text.includes('refund') || text.includes('payment') || text.includes('charged')) {
  category = 'Billing';
  recommendedAction = 'Review the transaction and verify the payment or refund status.';
} else if (text.includes('broken') || text.includes('damaged') || text.includes('defective')) {
    category = 'Product Issue';
    recommendedAction = 'Investigate the product issue and review replacement or repair options.';
  } else if (text.includes('login') || text.includes('account') || text.includes('password')) {
    category = 'Technical Support';
    recommendedAction = 'Investigate the account issue and guide the customer through troubleshooting.';
  }

  if (text.includes('urgent') || text.includes('immediately') || text.includes('twice') || text.includes('nobody responded')) {
    priority = 'High';
  }

  if (text.includes('legal') || text.includes('fraud') || text.includes('safety')) {
    priority = 'Critical';
  }

  summary = `Customer reported an issue related to ${category.toLowerCase()}. The complaint requires follow-up.`;

  res.json({
    category,
    priority,
    summary,
    recommendedAction,
    mode: 'Demo Mode - No API required'
  });
});

// Generate customer email replies - FREE DEMO MODE
app.post('/api/ai/draft-reply', (req, res) => {
  const { complaint, tone = 'professional' } = req.body;

  if (!complaint || !complaint.trim()) {
    return res.status(400).json({ error: 'Complaint is required.' });
  }

  const reply = `Subject: Regarding Your Recent Concern

Dear Customer,

Thank you for bringing this matter to our attention. We sincerely apologise for the inconvenience you have experienced.

We understand your concern and appreciate your patience. Our team will review the details of your complaint and follow up with an update as soon as possible.

Thank you for giving us the opportunity to address this matter.

Kind regards,
Customer Support Team`;

  res.json({
    reply,
    tone,
    mode: 'Demo Mode - No API required'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`TaskPilot backend running at http://localhost:${PORT}`);
});