import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let useMongo = false;
export const jsonDbPath = path.join(__dirname, '../data/db.json');

// Ensure data folder exists for JSON fallback
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(jsonDbPath)) {
  fs.writeFileSync(jsonDbPath, JSON.stringify({ transactions: [], budgets: [] }, null, 2));
}

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn('⚠️ MONGO_URI not found in env. Falling back to JSON database.');
    useMongo = false;
    return;
  }

  try {
    // Set a short timeout (3 seconds) so we don't hang if Mongo isn't running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✅ MongoDB connected successfully.');
    useMongo = true;
  } catch (error) {
    console.warn(`⚠️ Failed to connect to MongoDB: ${error.message}. Falling back to JSON database.`);
    useMongo = false;
  }
};

// JSON database helper functions
export const getJsonData = () => {
  try {
    const raw = fs.readFileSync(jsonDbPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { transactions: [], budgets: [] };
  }
};

export const saveJsonData = (data) => {
  fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
};
