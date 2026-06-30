import mongoose from 'mongoose';
import { useMongo, getJsonData, saveJsonData } from '../config/db.js';

// 1. Mongoose Schema and Model
const TransactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String }
});

const MongoTransaction = mongoose.model('Transaction', TransactionSchema);

// Helper to generate IDs for JSON fallback
const generateId = () => Math.random().toString(36).substring(2, 9);

// 2. Fallback JSON Repository
const JsonTransaction = {
  find: async (query = {}) => {
    let { transactions } = getJsonData();
    
    // basic filter if query is passed
    if (query.date && query.date.$gte && query.date.$lte) {
      const gte = new Date(query.date.$gte);
      const lte = new Date(query.date.$lte);
      transactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= gte && d <= lte;
      });
    }
    
    // sort by date descending by default
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  findById: async (id) => {
    const { transactions } = getJsonData();
    return transactions.find(t => t._id === id) || null;
  },

  create: async (data) => {
    const dbData = getJsonData();
    const newTransaction = {
      _id: generateId(),
      description: data.description,
      amount: Number(data.amount),
      type: data.type,
      category: data.category,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      notes: data.notes || '',
    };
    dbData.transactions.push(newTransaction);
    saveJsonData(dbData);
    return newTransaction;
  },

  findByIdAndUpdate: async (id, updateData) => {
    const dbData = getJsonData();
    const idx = dbData.transactions.findIndex(t => t._id === id);
    if (idx === -1) return null;
    
    const updated = {
      ...dbData.transactions[idx],
      ...updateData,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : dbData.transactions[idx].amount,
      date: updateData.date ? new Date(updateData.date).toISOString() : dbData.transactions[idx].date
    };
    dbData.transactions[idx] = updated;
    saveJsonData(dbData);
    return updated;
  },

  findByIdAndDelete: async (id) => {
    const dbData = getJsonData();
    const idx = dbData.transactions.findIndex(t => t._id === id);
    if (idx === -1) return null;
    const deleted = dbData.transactions[idx];
    dbData.transactions = dbData.transactions.filter(t => t._id !== id);
    saveJsonData(dbData);
    return deleted;
  }
};

// 3. Dynamic Router
const Transaction = {
  find: (query) => useMongo ? MongoTransaction.find(query).sort({ date: -1 }) : JsonTransaction.find(query),
  findById: (id) => useMongo ? MongoTransaction.findById(id) : JsonTransaction.findById(id),
  create: (data) => useMongo ? MongoTransaction.create(data) : JsonTransaction.create(data),
  findByIdAndUpdate: (id, updateData) => useMongo ? MongoTransaction.findByIdAndUpdate(id, updateData, { new: true }) : JsonTransaction.findByIdAndUpdate(id, updateData),
  findByIdAndDelete: (id) => useMongo ? MongoTransaction.findByIdAndDelete(id) : JsonTransaction.findByIdAndDelete(id),
};

export default Transaction;
