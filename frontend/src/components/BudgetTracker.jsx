import React, { useState } from 'react';
import { Target, AlertTriangle, Plus, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

const BUDGET_CATEGORIES = [
  'Food',
  'Rent',
  'Utilities',
  'Transport',
  'Entertainment',
  'Shopping',
  'Other'
];

const BudgetTracker = ({ budgets, transactions, onSaveBudget }) => {
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;

    onSaveBudget({
      category,
      amount: parseFloat(amount),
      period: 'monthly'
    });

    // Success burst if they set a budget
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#10b981']
    });

    setAmount('');
    setShowForm(false);
  };

  // Process budgets and calculate spends
  const budgetList = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const ratio = b.amount > 0 ? spent / b.amount : 0;
    const percent = Math.min(Math.round(ratio * 100), 999);

    let progressClass = 'success';
    if (ratio > 0.8) progressClass = 'danger';
    else if (ratio > 0.6) progressClass = 'warning';

    return {
      ...b,
      spent,
      percent,
      progressClass
    };
  });

  return (
    <div className="glass-card">
      <div className="card-header">
        <h2>
          <Target size={18} style={{ color: 'var(--color-primary)' }} />
          Monthly Budgets
        </h2>
        <button 
          className="btn btn-secondary btn-icon" 
          onClick={() => setShowForm(!showForm)}
          title="Define Budget Limit"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          <Plus size={16} />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div className="form-group">
            <label>Category</label>
            <select 
              className="form-control" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              {BUDGET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Limit Amount ($)</label>
            <input 
              type="number" 
              className="form-control" 
              placeholder="e.g. 500" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              required 
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem' }} onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.4rem' }}>
              Set Limit
            </button>
          </div>
        </form>
      )}

      <div className="budget-list">
        {budgetList.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <p style={{ fontSize: '0.85rem' }}>No budgets set yet. Track specific categories to avoid overspending.</p>
          </div>
        ) : (
          budgetList.map(b => (
            <div key={b._id} className="budget-item">
              <div className="budget-info">
                <span className="budget-cat">{b.category}</span>
                <span className="budget-vals">
                  <span className="budget-vals-spent">${b.spent.toFixed(2)}</span>
                  <span> / ${b.amount.toFixed(2)}</span>
                </span>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${b.progressClass}`} 
                  style={{ width: `${Math.min(b.percent, 100)}%` }}
                />
              </div>

              {b.percent >= 100 && (
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 500, marginTop: '0.1rem' }}>
                  <AlertTriangle size={12} />
                  <span>Exceeded by ${(b.spent - b.amount).toFixed(2)}!</span>
                </div>
              )}
              {b.percent >= 80 && b.percent < 100 && (
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: 'var(--color-warning)', fontSize: '0.75rem', fontWeight: 500, marginTop: '0.1rem' }}>
                  <Bell size={12} />
                  <span>Warning: {b.percent}% utilized.</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;
