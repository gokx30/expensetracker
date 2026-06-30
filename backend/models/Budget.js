import mongoose from 'mongoose';
import { useMongo, getJsonData, saveJsonData } from '../config/db.js';

// 1. Mongoose Schema and Model
const BudgetSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  period: { type: String, default: 'monthly' }
});

const MongoBudget = mongoose.model('Budget', BudgetSchema);

// 2. Fallback JSON Repository
const JsonBudget = {
  find: async () => {
    const { budgets } = getJsonData();
    return budgets;
  },

  findOne: async (query = {}) => {
    const { budgets } = getJsonData();
    if (query.category) {
      return budgets.find(b => b.category.toLowerCase() === query.category.toLowerCase()) || null;
    }
    return null;
  },

  findOneAndUpdate: async (query = {}, updateData, options = {}) => {
    const dbData = getJsonData();
    const category = query.category;
    if (!category) return null;

    let idx = dbData.budgets.findIndex(b => b.category.toLowerCase() === category.toLowerCase());
    if (idx === -1) {
      if (options.upsert) {
        const newBudget = {
          _id: Math.random().toString(36).substring(2, 9),
          category: category,
          amount: Number(updateData.amount || 0),
          period: updateData.period || 'monthly'
        };
        dbData.budgets.push(newBudget);
        saveJsonData(dbData);
        return newBudget;
      }
      return null;
    }

    const updated = {
      ...dbData.budgets[idx],
      ...updateData,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : dbData.budgets[idx].amount,
    };
    dbData.budgets[idx] = updated;
    saveJsonData(dbData);
    return updated;
  }
};

// 3. Dynamic Router
const Budget = {
  find: (query) => useMongo ? MongoBudget.find(query) : JsonBudget.find(query),
  findOne: (query) => useMongo ? MongoBudget.findOne(query) : JsonBudget.findOne(query),
  findOneAndUpdate: (query, updateData, options = { upsert: true }) => 
    useMongo 
      ? MongoBudget.findOneAndUpdate(query, updateData, { new: true, upsert: true }) 
      : JsonBudget.findOneAndUpdate(query, updateData, options),
};

export default Budget;
