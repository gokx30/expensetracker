import React, { useState } from 'react';
import { Edit2, Trash2, Search, Filter, AlertCircle } from 'lucide-react';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Extract unique categories from transactions to dynamically populate category filter
  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="glass-card" style={{ flexGrow: 1 }}>
      <div className="card-header">
        <h2>Recent Activity</h2>
      </div>

      {/* Filter and Search Controls */}
      <div className="filters-bar">
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search description or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.2rem', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ minWidth: '110px' }}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ minWidth: '130px' }}
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table Wrapper */}
      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={40} className="text-muted" />
          <p style={{ fontWeight: 500, fontSize: '1.05rem', marginBottom: '0.25rem' }}>No transactions found</p>
          <p style={{ fontSize: '0.85rem' }}>Try refining your search terms or filters.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t._id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                    {new Date(t.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.description}</div>
                    {t.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                        {t.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="category-tag">{t.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={t.type === 'income' ? 'txt-income' : 'txt-expense'} style={{ textAlign: 'right' }}>
                    {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => onEdit(t)}
                        title="Edit Transaction"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-icon"
                        onClick={() => onDelete(t._id)}
                        title="Delete Transaction"
                      >
                        <Trash2 size={13} style={{ display: 'block', margin: 'auto' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
