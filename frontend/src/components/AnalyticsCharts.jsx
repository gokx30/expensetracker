import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'];

const AnalyticsCharts = ({ transactions }) => {
  // 1. Process data for Income vs Expense monthly bar chart
  const getMonthlyData = () => {
    const monthlyMap = {};
    
    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sorted.forEach(t => {
      const date = new Date(t.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { name: monthYear, income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        monthlyMap[monthYear].income += Number(t.amount);
      } else {
        monthlyMap[monthYear].expense += Number(t.amount);
      }
    });

    return Object.values(monthlyMap);
  };

  // 2. Process data for Expense Category breakdown pie chart
  const getCategoryData = () => {
    const categoryMap = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
      });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
  };

  // 3. Process data for Cash Flow Area Chart (Cumulative Savings)
  const getCashFlowData = () => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let cumulative = 0;
    
    return sorted.map(t => {
      if (t.type === 'income') {
        cumulative += Number(t.amount);
      } else {
        cumulative -= Number(t.amount);
      }
      
      return {
        date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: cumulative
      };
    });
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const cashFlowData = getCashFlowData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
          <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem', color: '#9ca3af' }}>{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color || item.fill, fontSize: '0.9rem', fontWeight: 600 }}>
              {item.name}: ${Number(item.value).toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-grid">
      {/* 1. Bar Chart: Income vs Expenses */}
      <div className="glass-card">
        <div className="card-header">
          <h2>
            <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} />
            Cash Flow Trend
          </h2>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          {monthlyData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Add transactions to see cash flow trends
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Pie Chart: Expenses by Category */}
      <div className="glass-card">
        <div className="card-header">
          <h2>
            <PieIcon size={18} style={{ color: 'var(--color-warning)' }} />
            Category Breakdown
          </h2>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          {categoryData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No expenses recorded
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Area Chart: Net Cash Flow Balance Over Time */}
      <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
        <div className="card-header">
          <h2>
            <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
            Net Balance History
          </h2>
        </div>
        <div style={{ width: '100%', height: 200 }}>
          {cashFlowData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Add transactions to see net balance trajectory
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  name="Net Balance" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#balanceGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
