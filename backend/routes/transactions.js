import express from 'express';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new transaction
router.post('/', async (req, res) => {
  try {
    const { description, amount, type, category, date, notes } = req.body;
    if (!description || !amount || !type || !category) {
      return res.status(400).json({ message: 'Required fields are missing.' });
    }
    
    const newTransaction = await Transaction.create({
      description,
      amount,
      type,
      category,
      date,
      notes
    });
    
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT (update) a transaction
router.put('/:id', async (req, res) => {
  try {
    const { description, amount, type, category, date, notes } = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, {
      description,
      amount,
      type,
      category,
      date,
      notes
    });
    
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }
    
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a transaction
router.delete('/:id', async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }
    res.json({ message: 'Transaction deleted successfully.', deletedTransaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
