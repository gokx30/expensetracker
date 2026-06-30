import PDFDocument from 'pdfkit';

export const generateExpensePDF = (res, data) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Stream PDF directly to client response
  doc.pipe(res);

  const { transactions, budgets, insights } = data;

  // Calculate stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // Colors
  const primaryColor = '#4F46E5'; // Indigo
  const textDark = '#1F2937';
  const textMuted = '#4B5563';
  const borderLight = '#E5E7EB';
  const successColor = '#10B981';
  const dangerColor = '#EF4444';

  // --- Title Header ---
  doc.fontSize(24).fillColor(primaryColor).text('EXPENSE TRACKER', { align: 'left' });
  doc.fontSize(10).fillColor(textMuted).text('AI-Powered Financial Insights & Report', { align: 'left' });
  doc.moveDown();

  // Date info
  doc.fontSize(8).fillColor(textMuted).text(`Report Generated: ${new Date().toLocaleString()}`, { align: 'right' });
  doc.moveDown(1.5);

  // --- Summary Cards Grid ---
  const cardWidth = 115;
  const cardHeight = 55;
  const startX = 50;
  const startY = 110;

  const cards = [
    { title: 'Total Income', val: `$${totalIncome.toFixed(2)}`, color: successColor },
    { title: 'Total Expenses', val: `$${totalExpenses.toFixed(2)}`, color: dangerColor },
    { title: 'Net Savings', val: `$${netSavings.toFixed(2)}`, color: primaryColor },
    { title: 'Savings Rate', val: `${savingsRate}%`, color: '#F59E0B' }
  ];

  cards.forEach((c, idx) => {
    const x = startX + idx * (cardWidth + 18);
    // Draw card background
    doc.rect(x, startY, cardWidth, cardHeight).fill('#F9FAFB');
    doc.rect(x, startY, cardWidth, 2).fill(c.color); // top border line
    
    // Draw text
    doc.fillColor(textMuted).fontSize(8).text(c.title, x + 8, startY + 12);
    doc.fillColor(textDark).fontSize(14).text(c.val, x + 8, startY + 28);
  });

  doc.moveDown(5);

  // --- AI Insights Summary Section ---
  doc.fillColor(primaryColor).fontSize(14).text('AI Spending Suggestions & Insights', startX, 190);
  doc.moveTo(startX, 208).lineTo(545, 208).stroke(borderLight);
  
  doc.moveDown(1.5);
  doc.fontSize(9).fillColor(textDark);
  if (insights && insights.length > 0) {
    insights.forEach((insight) => {
      doc.text(`• ${insight}`, { width: 495, align: 'justify' });
      doc.moveDown(0.5);
    });
  } else {
    doc.text('No AI suggestions available for this report period.', { width: 495 });
  }

  doc.moveDown(2);

  // --- Budgets Summary Section ---
  const currentY = doc.y;
  doc.fillColor(primaryColor).fontSize(14).text('Monthly Budget Performance', startX, currentY);
  doc.moveTo(startX, currentY + 18).lineTo(545, currentY + 18).stroke(borderLight);
  doc.moveDown(1.5);

  // Table Headers
  const tableY = doc.y;
  doc.fontSize(9).fillColor(textMuted);
  doc.text('Category', startX + 10, tableY);
  doc.text('Monthly Budget', startX + 150, tableY);
  doc.text('Spent Amount', startX + 280, tableY);
  doc.text('Status', startX + 410, tableY);
  
  doc.moveTo(startX, tableY + 12).lineTo(545, tableY + 12).stroke(borderLight);

  // Budgets items
  let budgetY = tableY + 16;
  budgets.forEach(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);

    const isOver = spent > b.amount;
    const statusText = isOver ? 'Over Budget' : 'Within Budget';
    const statusColor = isOver ? dangerColor : successColor;

    doc.fillColor(textDark).fontSize(9);
    doc.text(b.category, startX + 10, budgetY);
    doc.text(`$${b.amount.toFixed(2)}`, startX + 150, budgetY);
    doc.text(`$${spent.toFixed(2)}`, startX + 280, budgetY);
    doc.fillColor(statusColor).text(statusText, startX + 410, budgetY);

    budgetY += 16;
  });

  if (budgets.length === 0) {
    doc.fillColor(textMuted).text('No active budgets defined.', startX + 10, budgetY);
    budgetY += 16;
  }

  doc.y = budgetY + 20;

  // --- Transactions Log ---
  doc.fillColor(primaryColor).fontSize(14).text('Recent Transactions Log');
  doc.moveTo(startX, doc.y + 2).lineTo(545, doc.y + 2).stroke(borderLight);
  doc.moveDown(1);

  // Table Headers
  const transHeaderY = doc.y;
  doc.fontSize(9).fillColor(textMuted);
  doc.text('Date', startX + 10, transHeaderY);
  doc.text('Description', startX + 90, transHeaderY);
  doc.text('Category', startX + 240, transHeaderY);
  doc.text('Type', startX + 370, transHeaderY);
  doc.text('Amount', startX + 450, transHeaderY);

  doc.moveTo(startX, transHeaderY + 12).lineTo(545, transHeaderY + 12).stroke(borderLight);
  
  let transY = transHeaderY + 16;
  transactions.slice(0, 15).forEach(t => {
    // Handle pagination page boundaries
    if (transY > 740) {
      doc.addPage();
      transY = 50; // reset to margin
      
      // Re-draw headers
      doc.fontSize(9).fillColor(textMuted);
      doc.text('Date', startX + 10, transY);
      doc.text('Description', startX + 90, transY);
      doc.text('Category', startX + 240, transY);
      doc.text('Type', startX + 370, transY);
      doc.text('Amount', startX + 450, transY);
      doc.moveTo(startX, transY + 12).lineTo(545, transY + 12).stroke(borderLight);
      transY += 16;
    }

    const dateStr = new Date(t.date).toLocaleDateString();
    const typeColor = t.type === 'income' ? successColor : dangerColor;

    doc.fillColor(textDark).fontSize(8);
    doc.text(dateStr, startX + 10, transY);
    doc.text(t.description, startX + 90, transY, { width: 140, height: 12, ellipsis: true });
    doc.text(t.category, startX + 240, transY);
    doc.fillColor(typeColor).text(t.type.toUpperCase(), startX + 370, transY);
    doc.fillColor(typeColor).text(`$${t.amount.toFixed(2)}`, startX + 450, transY);

    transY += 16;
  });

  if (transactions.length === 0) {
    doc.fillColor(textMuted).text('No transactions found.', startX + 10, transY);
  }

  // End Document
  doc.end();
};
