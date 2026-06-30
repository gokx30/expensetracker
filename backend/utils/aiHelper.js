import { GoogleGenerativeAI } from '@google/generative-ai';

function generateRuleBasedInsights(totalIncome, totalExpenses, netSavings, savingsRate, categoryBreakdown) {
  const suggestions = [];

  // Insight 1: Savings Rate / Overall Health
  if (totalIncome === 0) {
    suggestions.push("Set up an income source to begin tracking your savings rate and get personalized suggestions.");
  } else if (savingsRate < 0) {
    suggestions.push(`⚠️ Danger Zone: Your expenses exceed your income by $${Math.abs(netSavings).toFixed(2)}. Review your non-essential spending immediately to avoid debt.`);
  } else if (savingsRate < 10) {
    suggestions.push(`📈 Your savings rate is currently ${savingsRate}%. Financial advisors recommend saving at least 15-20% of your income. Look for small subscription cancellations or cut back on dining out.`);
  } else if (savingsRate >= 20) {
    suggestions.push(`🎉 Great job! Your savings rate is ${savingsRate}%, which exceeds the standard 20% savings threshold. Consider investing your surplus of $${netSavings.toFixed(2)}.`);
  } else {
    suggestions.push(`👍 Good start! You are saving ${savingsRate}% of your income. Try to increase this to 20% by establishing tighter boundaries on lifestyle inflation.`);
  }

  // Insight 2: Category Budgets / Overruns
  const overBudgetCategories = categoryBreakdown.filter(c => c.budget > 0 && c.amount > c.budget);
  const nearBudgetCategories = categoryBreakdown.filter(c => c.budget > 0 && c.amount > c.budget * 0.8 && c.amount <= c.budget);

  if (overBudgetCategories.length > 0) {
    const cats = overBudgetCategories.map(c => `${c.name} (over by $${(c.amount - c.budget).toFixed(2)})`).join(', ');
    suggestions.push(`⚠️ Budget Overrun: You have exceeded your budget limits in: ${cats}. You need to decrease spending in these categories next month.`);
  } else if (nearBudgetCategories.length > 0) {
    const cats = nearBudgetCategories.map(c => c.name).join(', ');
    suggestions.push(`⏳ Warning: You have used over 80% of your allocated budget for: ${cats}. Keep spending on these categories strictly to essentials for the remainder of the month.`);
  }

  // Insight 3: High Spending Category Analysis
  const sortedExpenses = [...categoryBreakdown].sort((a, b) => b.amount - a.amount);
  if (sortedExpenses.length > 0) {
    const topExp = sortedExpenses[0];
    const percentageOfExpenses = totalExpenses > 0 ? ((topExp.amount / totalExpenses) * 100).toFixed(1) : 0;
    
    if (topExp.name.toLowerCase() === 'food' || topExp.name.toLowerCase() === 'dining') {
      suggestions.push(`🍴 High Food Spend: Your largest expense is ${topExp.name} ($${topExp.amount.toFixed(2)}), consuming ${percentageOfExpenses}% of your total budget. Meal prepping twice a week could save you up to $${(topExp.amount * 0.25).toFixed(2)} monthly.`);
    } else if (topExp.name.toLowerCase() === 'entertainment' || topExp.name.toLowerCase() === 'shopping') {
      suggestions.push(`🛍️ Leisure Spend: You spent $${topExp.amount.toFixed(2)} on ${topExp.name} (${percentageOfExpenses}% of total expenses). Try a "48-hour cool-off rule" before making non-essential purchases.`);
    } else {
      suggestions.push(`📊 Spending Alert: ${topExp.name} is your highest expense category at $${topExp.amount.toFixed(2)} (${percentageOfExpenses}% of total). Look into finding cheaper alternatives or renegotiating service rates.`);
    }
  }

  // Insight 4: Dynamic Budget Suggestion
  const noBudgetCategories = categoryBreakdown.filter(c => c.budget === 0 && c.amount > 50);
  if (noBudgetCategories.length > 0) {
    const topUnbudgeted = noBudgetCategories.sort((a, b) => b.amount - a.amount)[0];
    suggestions.push(`⚙️ Budget Recommendation: You spent $${topUnbudgeted.amount.toFixed(2)} on ${topUnbudgeted.name} without a budget set. Setting a $${(topUnbudgeted.amount * 0.9).toFixed(0)} monthly limit can protect your cash flow.`);
  } else if (suggestions.length < 3) {
    suggestions.push("💡 Tip: Try automating 10% of your monthly savings directly to a separate account on payday to eliminate the temptation to spend.");
  }

  return suggestions;
}

export const getAIInsights = async (transactions, budgets) => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  const categories = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  const categoryBreakdown = Object.entries(categories).map(([name, amount]) => {
    const budget = budgets.find(b => b.category.toLowerCase() === name.toLowerCase())?.amount || 0;
    return { name, amount, budget };
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
You are an expert personal finance advisor. Analyze the following user financial data:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net Savings: $${netSavings.toFixed(2)}
- Savings Rate: ${savingsRate}%
- Budget and Expense Breakdown:
${categoryBreakdown.map(c => `  * ${c.name}: Spent $${c.amount.toFixed(2)} / Budget limit: ${c.budget ? `$${c.budget.toFixed(2)}` : 'No budget set'}`).join('\n')}

Based on this, generate exactly 3-4 bullet-point recommendations for the user to optimize their budget, cut unnecessary costs, and improve savings.
Provide your response strictly as a JSON array of strings, e.g. ["suggestion 1", "suggestion 2", "suggestion 3"]. Do not return markdown, do not write code blocks, just return the raw JSON array string.
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.warn('Gemini API call failed, falling back to rule-based insights engine.', e.message);
    }
  }

  // Fallback to local rule-based insights engine
  return generateRuleBasedInsights(totalIncome, totalExpenses, netSavings, savingsRate, categoryBreakdown);
};
