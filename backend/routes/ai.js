import express from 'express';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { getAIInsights } from '../utils/aiHelper.js';

const router = express.Router();

// GET AI insights
router.get('/insights', async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    const budgets = await Budget.find({});
    
    const insights = await getAIInsights(transactions, budgets);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
