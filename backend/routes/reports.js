import express from 'express';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { getAIInsights } from '../utils/aiHelper.js';
import { generateExpensePDF } from '../utils/pdfGenerator.js';

const router = express.Router();

// GET PDF Report
router.get('/pdf', async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    const budgets = await Budget.find({});
    
    // Generate latest insights to include in the PDF
    const insights = await getAIInsights(transactions, budgets);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial_report.pdf');

    generateExpensePDF(res, {
      transactions,
      budgets,
      insights
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
