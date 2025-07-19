const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client', 'build')));

const EXPENSES_FILE = path.join(__dirname, 'expenses.json');

// Helper to read expenses
function readExpenses() {
  try {
    const data = fs.readFileSync(EXPENSES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to write expenses
function writeExpenses(expenses) {
  fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
}

// Add new expense
app.post('/api/expenses', (req, res) => {
  let { amount, category, date, description, tags } = req.body;
  if (!amount || !category || !date) {
    return res.status(400).json({ error: 'Amount, category, and date are required.' });
  }
  // Ensure date is YYYY-MM-DD
  if (typeof date === 'string' && date.length > 10) {
    date = date.slice(0, 10);
  } else if (date instanceof Date) {
    date = date.toISOString().slice(0, 10);
  }
  const expenses = readExpenses();
  const newExpense = {
    id: Date.now().toString(),
    amount,
    category,
    date,
    description: description || '',
    tags: Array.isArray(tags) ? tags : []
  };
  expenses.push(newExpense);
  writeExpenses(expenses);
  res.status(201).json(newExpense);
});

// Get all expenses
app.get('/api/expenses', (req, res) => {
  const expenses = readExpenses();
  res.json(expenses);
});

// Update expense by ID
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category, date, description, tags } = req.body;
  
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required.' });
  }
  
  const expenses = readExpenses();
  const expenseIndex = expenses.findIndex(exp => exp.id === id);
  
  if (expenseIndex === -1) {
    return res.status(404).json({ error: 'Expense not found.' });
  }
  
  // Update the expense while preserving existing fields if not provided
  const updatedExpense = {
    ...expenses[expenseIndex],
    ...(amount !== undefined && { amount }),
    ...(category !== undefined && { category }),
    ...(date !== undefined && { date }),
    ...(description !== undefined && { description }),
    ...(tags !== undefined && { tags })
  };
  
  expenses[expenseIndex] = updatedExpense;
  writeExpenses(expenses);
  res.json(updatedExpense);
});

const INCOME_FILE = path.join(__dirname, 'income.json');

// Helper to read income
function readIncome() {
  try {
    const data = fs.readFileSync(INCOME_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to write income
function writeIncome(income) {
  fs.writeFileSync(INCOME_FILE, JSON.stringify(income, null, 2));
}

// Add new income
app.post('/api/income', (req, res) => {
  let { amount, source, date, description } = req.body;
  if (!amount || !source || !date) {
    return res.status(400).json({ error: 'Amount, source, and date are required.' });
  }
  // Ensure date is YYYY-MM-DD
  if (typeof date === 'string' && date.length > 10) {
    date = date.slice(0, 10);
  } else if (date instanceof Date) {
    date = date.toISOString().slice(0, 10);
  }
  const income = readIncome();
  const newIncome = {
    id: Date.now().toString(),
    amount,
    source,
    date,
    description: description || ''
  };
  income.push(newIncome);
  writeIncome(income);
  res.status(201).json(newIncome);
});

// Get all income
app.get('/api/income', (req, res) => {
  const income = readIncome();
  res.json(income);
});

// Update income by ID
app.put('/api/income/:id', (req, res) => {
  const { id } = req.params;
  const { amount, source, date, description } = req.body;
  
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required.' });
  }
  
  const income = readIncome();
  const incomeIndex = income.findIndex(inc => inc.id === id);
  
  if (incomeIndex === -1) {
    return res.status(404).json({ error: 'Income not found.' });
  }
  
  // Update the income while preserving existing fields if not provided
  const updatedIncome = {
    ...income[incomeIndex],
    ...(amount !== undefined && { amount }),
    ...(source !== undefined && { source }),
    ...(date !== undefined && { date }),
    ...(description !== undefined && { description })
  };
  
  income[incomeIndex] = updatedIncome;
  writeIncome(income);
  res.json(updatedIncome);
});

const CATEGORIES_FILE = path.join(__dirname, 'categories.json');

// Helper to read categories
function readCategories() {
  try {
    const data = fs.readFileSync(CATEGORIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other']; // default
  }
}

// Helper to write categories
function writeCategories(categories) {
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

// Get all categories
app.get('/api/categories', (req, res) => {
  res.json(readCategories());
});

// Add a new category
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required' });
  const categories = readCategories();
  if (categories.includes(name)) return res.status(400).json({ error: 'Category already exists' });
  categories.push(name);
  writeCategories(categories);
  res.status(201).json({ name });
});

// Delete a category
app.delete('/api/categories/:name', (req, res) => {
  const name = req.params.name;
  let categories = readCategories();
  if (!categories.includes(name)) return res.status(404).json({ error: 'Category not found' });
  categories = categories.filter(cat => cat !== name);
  writeCategories(categories);
  res.json({ success: true });
});

const INCOME_CATEGORIES_FILE = path.join(__dirname, 'income_categories.json');

// Helper to read income categories
function readIncomeCategories() {
  try {
    const data = fs.readFileSync(INCOME_CATEGORIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return ['Salary', 'Freelance', 'Bonus', 'Other']; // default
  }
}

// Helper to write income categories
function writeIncomeCategories(categories) {
  fs.writeFileSync(INCOME_CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

// Get all income categories
app.get('/api/income-categories', (req, res) => {
  res.json(readIncomeCategories());
});

// Add a new income category
app.post('/api/income-categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required' });
  const categories = readIncomeCategories();
  if (categories.includes(name)) return res.status(400).json({ error: 'Category already exists' });
  categories.push(name);
  writeIncomeCategories(categories);
  res.status(201).json({ name });
});

// Delete an income category
app.delete('/api/income-categories/:name', (req, res) => {
  const name = req.params.name;
  let categories = readIncomeCategories();
  if (!categories.includes(name)) return res.status(404).json({ error: 'Category not found' });
  categories = categories.filter(cat => cat !== name);
  writeIncomeCategories(categories);
  res.json({ success: true });
});

// Catch-all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 