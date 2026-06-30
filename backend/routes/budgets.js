import express from 'express';
import Budget from '../models/Budget.js';

const router = express.Router();

// GET all budgets
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({});
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST or update a budget (Upsert by Category)
router.post('/', async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    if (!category || amount === undefined) {
      return res.status(400).json({ message: 'Category and amount are required.' });
    }

    // Normalizing category name (e.g. food -> Food)
    const normalizedCategory = category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();

    const budget = await Budget.findOneAndUpdate(
      { category: normalizedCategory },
      { amount: Number(amount), period: period || 'monthly' },
      { upsert: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
