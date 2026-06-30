import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileDown, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Wallet,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from './utils/api';
import './styles/App.css';

// Components
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import AnalyticsCharts from './components/AnalyticsCharts';
import BudgetTracker from './components/BudgetTracker';
import AIInsights from './components/AIInsights';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Fetch initial dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const txData = await api.getTransactions();
      setTransactions(txData);

      const budgetData = await api.getBudgets();
      setBudgets(budgetData);

      fetchAIInsights();
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const fetchAIInsights = async () => {
    setLoadingAI(true);
    try {
      const data = await api.getAIInsights();
      setInsights(data.insights);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Form submission handler (Create or Update)
  const handleFormSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        await api.updateTransaction(editingTransaction._id, formData);
      } else {
        await api.createTransaction(formData);
        
        // Celebration confetti for recording!
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.8 },
          colors: formData.type === 'income' ? ['#10b981', '#34d399'] : ['#6366f1', '#a5b4fc']
        });
      }
      
      fetchDashboardData();
      setEditingTransaction(null);
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  // Delete transaction handler
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.deleteTransaction(id);
        fetchDashboardData();
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    }
  };

  // Edit transaction initiator
  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  // Budget saving handler
  const handleSaveBudget = async (budgetData) => {
    try {
      await api.saveBudget(budgetData);
      const updatedBudgets = await api.getBudgets();
      setBudgets(updatedBudgets);
      fetchAIInsights(); // Regenerate insights based on new budget
    } catch (err) {
      console.error('Error saving budget:', err);
    }
  };

  // Calculate metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title-container">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Wallet size={36} style={{ color: 'var(--color-primary)' }} />
            WealthSense
          </h1>
          <p>Expense Tracker with AI Insights</p>
        </div>

        <div className="header-actions">
          <a 
            href={api.getPDFExportUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <FileDown size={16} />
            Export PDF Report
          </a>

          <button 
            className="btn btn-primary" 
            onClick={() => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="kpi-grid">
        <div className="glass-card kpi-card kpi-income">
          <div className="kpi-title">Total Income</div>
          <div className="kpi-value">${totalIncome.toFixed(2)}</div>
          <div className="kpi-trend" style={{ color: 'var(--color-success)' }}>
            <TrendingUp size={14} />
            Incoming cash flow
          </div>
        </div>

        <div className="glass-card kpi-card kpi-expense">
          <div className="kpi-title">Total Expenses</div>
          <div className="kpi-value">${totalExpenses.toFixed(2)}</div>
          <div className="kpi-trend" style={{ color: 'var(--color-danger)' }}>
            <TrendingDown size={14} />
            Outgoing cash flow
          </div>
        </div>

        <div className="glass-card kpi-card kpi-savings">
          <div className="kpi-title">Net Savings</div>
          <div className="kpi-value" style={{ color: netSavings >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {netSavings < 0 ? '-' : ''}${Math.abs(netSavings).toFixed(2)}
          </div>
          <div className="kpi-trend" style={{ color: netSavings >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {netSavings >= 0 ? 'Surplus balance' : 'Deficit balance'}
          </div>
        </div>

        <div className="glass-card kpi-card kpi-rate">
          <div className="kpi-title">Savings Rate</div>
          <div className="kpi-value">{savingsRate}%</div>
          <div className="kpi-trend" style={{ color: savingsRate >= 20 ? 'var(--color-success)' : savingsRate >= 10 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
            <Percent size={14} />
            Of total income saved
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout Grid */}
      <main className="dashboard-grid">
        {/* Left Column: Charts and Transactions */}
        <div className="left-column">
          <AnalyticsCharts transactions={transactions} />
          
          <TransactionList 
            transactions={transactions} 
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </div>

        {/* Right Column: AI Suggestion Cards & Budgets */}
        <div className="right-column">
          <AIInsights 
            insights={insights}
            loading={loadingAI}
            onRegenerate={fetchAIInsights}
          />

          <BudgetTracker 
            budgets={budgets}
            transactions={transactions}
            onSaveBudget={handleSaveBudget}
          />
        </div>
      </main>

      {/* Add / Edit Form Modal */}
      <TransactionForm 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
      />
    </div>
  );
}

export default App;
