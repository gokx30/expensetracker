import React, { useState, useEffect } from 'react';
import { X, DollarSign, Tag, FileText, Calendar } from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Rent',
  'Utilities',
  'Transport',
  'Entertainment',
  'Shopping',
  'Salary',
  'Investment',
  'Other'
];

const TransactionForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        amount: initialData.amount.toString(),
        date: new Date(initialData.date).toISOString().split('T')[0],
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="modal-title">
          {initialData ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', background: formData.type === 'expense' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '8px', border: formData.type === 'expense' ? '1px solid var(--color-danger)' : '1px solid var(--border-color)', justifyContent: 'center' }}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={() => setFormData({ ...formData, type: 'expense', category: 'Food' })}
                  style={{ display: 'none' }}
                />
                <span style={{ color: formData.type === 'expense' ? 'var(--color-danger)' : 'var(--color-text-muted)', fontWeight: 600 }}>Expense</span>
              </label>
              
              <label style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', background: formData.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '8px', border: formData.type === 'income' ? '1px solid var(--color-success)' : '1px solid var(--border-color)', justifyContent: 'center' }}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={() => setFormData({ ...formData, type: 'income', category: 'Salary' })}
                  style={{ display: 'none' }}
                />
                <span style={{ color: formData.type === 'income' ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600 }}>Income</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              className="form-control"
              placeholder="e.g., Grocery Shopping"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="amount">Amount ($)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="number"
                  step="0.01"
                  id="amount"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{ paddingLeft: '2.2rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="category">Category</label>
              <div style={{ position: 'relative' }}>
                <Tag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <select
                  id="category"
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ paddingLeft: '2.2rem', appearance: 'none', width: '100%' }}
                >
                  {formData.type === 'income' ? (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Investment">Investment</option>
                      <option value="Other">Other</option>
                    </>
                  ) : (
                    CATEGORIES.filter(c => c !== 'Salary' && c !== 'Investment').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  )}
                  {formData.type === 'expense' && <option value="Investment">Investment</option>}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="date">Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="date"
                  id="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ paddingLeft: '2.2rem' }}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <div style={{ position: 'relative' }}>
              <FileText size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-muted)' }} />
              <textarea
                id="notes"
                className="form-control"
                placeholder="Details or tags..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ paddingLeft: '2.2rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
