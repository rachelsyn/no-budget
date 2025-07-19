import './App.css';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Constants
const API_BASE_URL = 'http://localhost:5001/api';
const CURRENCY = 'HK$';
const THEME_STORAGE_KEY = 'isDarkMode';

const THEME_COLORS = {
  light: {
    primary: '#36A2EB',
    secondary: '#eee',
    expense: '#0FA3B1',
    income: '#F7A072',
    background: '#fff',
    text: '#333',
    border: '#ccc',
    chartExpense: '#FFC8DD',
    chartIncome: '#BDE0FE',
    chartPalette: ['#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF']
  },
  dark: {
    primary: '#967AA1',
    secondary: '#192A51',
    expense: '#b6dcfe',
    income: '#90EE90',
    background: '#192A51',
    text: '#F5E6E8',
    border: '#AAA1C8',
    chartExpense: '#FFAFCC',
    chartIncome: '#A2D2FF',
    chartPalette: ['#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF']
  }
};

const CATEGORY_ICONS = {
  'Food': '🍔',
  'Meals': '🍽️',
  'Transport': '🚗',
  'Transportation': '🚌',
  'Shopping': '🛍️',
  'Bills': '💡',
  'Entertainment': '🎬',
  'Other': '📦',
};

const INCOME_ICON_PATTERNS = [
  { pattern: /salary/i, icon: '💼' },
  { pattern: /freelance/i, icon: '🧑‍💻' },
  { pattern: /bonus/i, icon: '🎁' }
];

// Utility functions
const getLocalDateString = () => {
  const today = new Date();
  return today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
};

const formatCurrency = (amount) => `${CURRENCY}${Number(amount).toFixed(2)}`;

const calculateTotals = (items, groupBy, amountKey = 'amount') => {
  return items.reduce((acc, item) => {
    const key = item[groupBy];
    acc[key] = (acc[key] || 0) + Number(item[amountKey]);
    return acc;
  }, {});
};

const getIcon = (name, type = 'expense') => {
  if (type === 'expense') {
    return CATEGORY_ICONS[name] || '💸';
  }
  
  for (const { pattern, icon } of INCOME_ICON_PATTERNS) {
    if (pattern.test(name)) return icon;
  }
  return '💰';
};

const getThemeColors = (isDarkMode) => isDarkMode ? THEME_COLORS.dark : THEME_COLORS.light;

// Style functions - memoized to avoid recreation
const createStyles = (colors) => ({
  formInput: { 
    marginBottom: 6, 
    width: '100%', 
    borderRadius: 6, 
    border: `1px solid ${colors.border}`, 
    padding: 6,
    backgroundColor: colors.background,
    color: colors.text
  },
  button: {
    primary: { 
      background: colors.primary, 
      color: colors.text, 
      border: 'none', 
      borderRadius: 6, 
      padding: '4px 12px' 
    },
    secondary: { 
      background: colors.secondary, 
      color: colors.text, 
      border: `1px solid ${colors.border}`, 
      borderRadius: 6, 
      padding: '4px 12px' 
    },
    expense: { 
      fontSize: 14, 
      padding: '4px 12px', 
      borderRadius: 8, 
      border: 'none', 
      background: colors.expense, 
      color: 'black', 
      cursor: 'pointer', 
      marginBottom: 4 
    },
    income: { 
      fontSize: 14, 
      padding: '4px 12px', 
      borderRadius: 8, 
      border: 'none', 
      background: colors.income, 
      color: 'black', 
      cursor: 'pointer', 
      marginBottom: 4 
    }
  }
});

// API utilities
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };
  
  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const fetchAllData = async () => {
  const endpoints = ['expenses', 'income', 'categories', 'income-categories'];
  return Promise.all(endpoints.map(endpoint => apiCall(endpoint)));
};

// Dark Mode Toggle Component
function DarkModeToggle({ isDarkMode, onToggle }) {
  return (
    <div className="dark-mode-toggle">
      <button onClick={onToggle} className="dark-mode-button">
        <span className="toggle-icon">{isDarkMode ? '☀️' : '🌙'}</span>
        <span className="toggle-text">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    </div>
  );
}

// Reusable Form Component
function TransactionForm({ isOpen, type, category, form, onFormChange, onSubmit, onClose, styles }) {
  if (!isOpen) return null;
  
  const isExpense = type === 'expense';
  
  return (
    <div style={{ marginTop: 10, width: '100%' }}>
      <input
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={e => onFormChange('amount', e.target.value)}
        style={styles.formInput}
      />
      {isExpense && (
        <input
          type="text"
          placeholder="Tag (e.g. breakfast)"
          value={form.tag}
          onChange={e => onFormChange('tag', e.target.value)}
          style={styles.formInput}
        />
      )}
      <div>
        <button onClick={onSubmit} style={{ ...styles.button.primary, marginRight: 8 }}>Add</button>
        <button onClick={onClose} style={styles.button.secondary}>Cancel</button>
      </div>
    </div>
  );
}

// Reusable Card Component
function TransactionCard({ category, total, icon, color, type, form, onOpenForm, onFormChange, onSubmit, onCloseForm, styles }) {
  const cardClass = type === 'expense' ? 'card-expense' : 'card-income';
  const buttonStyle = type === 'expense' ? styles.button.expense : styles.button.income;
  
  return (
    <div className={cardClass}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>{category}</div>
      <div style={{ fontSize: 22, color, fontWeight: 700, marginBottom: 8 }}>
        {formatCurrency(total || 0)}
      </div>
      <button onClick={() => onOpenForm(category)} style={buttonStyle}>Add</button>
      <TransactionForm
        isOpen={form?.open || false}
        type={type}
        category={category}
        form={form || { amount: '', tag: '' }}
        onFormChange={(field, value) => onFormChange(category, field, value)}
        onSubmit={() => onSubmit(category)}
        onClose={() => onCloseForm(category)}
        styles={styles}
      />
    </div>
  );
}

function HomePage(props) {
  const { 
    categories, expenseTotals, expenseForm, 
    incomeCategories, incomeTotals, incomeForm,
    onExpenseFormChange, onIncomeFormChange,
    onOpenExpenseForm, onCloseExpenseForm,
    onOpenIncomeForm, onCloseIncomeForm,
    onAddExpense, onAddIncome, onAddIncomeCategory,
    styles, colors
  } = props;
  
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  
  const handleAddCategory = useCallback(() => {
    if (newIncomeCategory.trim()) {
      onAddIncomeCategory(newIncomeCategory.trim());
      setNewIncomeCategory('');
    }
  }, [newIncomeCategory, onAddIncomeCategory]);
  
  return (
    <>
      {/* Expenses Section */}
      <div style={{ marginBottom: 40 }}>
        <h2>Expenses</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {categories.slice(0, 9).map(cat => (
            <TransactionCard
              key={cat}
              category={cat}
              total={expenseTotals[cat]}
              icon={getIcon(cat, 'expense')}
              color={colors.expense}
              type="expense"
              form={expenseForm[cat]}
              onOpenForm={onOpenExpenseForm}
              onFormChange={onExpenseFormChange}
              onSubmit={onAddExpense}
              onCloseForm={onCloseExpenseForm}
              styles={styles}
            />
          ))}
        </div>
      </div>

      {/* Income Section */}
      <div style={{ marginBottom: 40 }}>
        <h2>Income</h2>
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Add income category (e.g. Salary)"
            value={newIncomeCategory}
            onChange={e => setNewIncomeCategory(e.target.value)}
            style={styles.formInput}
          />
          <button onClick={handleAddCategory} style={styles.button.income}>
            Add
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {incomeCategories.length === 0 && (
            <div style={{ color: colors.text }}>No income categories yet</div>
          )}
          {incomeCategories.slice(0, 9).map(src => (
            <TransactionCard
              key={src}
              category={src}
              total={incomeTotals[src]}
              icon={getIcon(src, 'income')}
              color={colors.income}
              type="income"
              form={incomeForm[src]}
              onOpenForm={onOpenIncomeForm}
              onFormChange={onIncomeFormChange}
              onSubmit={onAddIncome}
              onCloseForm={onCloseIncomeForm}
              styles={styles}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function TransactionsPage(props) {
  const { 
    expenses, 
    income, 
    editingTransaction, 
    editAmount, 
    onEditTransaction, 
    onCancelEdit, 
    onSaveEdit, 
    onEditAmountChange,
    isDarkMode
  } = props;
  const [selectedDate, setSelectedDate] = useState(null);
  
  const selectedDateStr = useMemo(() => {
    if (!selectedDate) return null;
    return selectedDate.getFullYear() + '-' + 
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(selectedDate.getDate()).padStart(2, '0');
  }, [selectedDate]);
    
  const transactionsForDate = useMemo(() => {
    if (!selectedDateStr) return { expenses: [], income: [] };
    return {
      expenses: expenses.filter(e => e.date === selectedDateStr),
      income: income.filter(i => i.date === selectedDateStr)
    };
  }, [expenses, income, selectedDateStr]);

  const renderTransactionList = useCallback((items, type) => (
    items.length === 0 ? (
      <p>None</p>
    ) : (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item.id} style={{ 
            margin: '8px 0', 
            padding: '12px', 
            border: isDarkMode ? '1px solid var(--border-color)' : '1px solid #eee', 
            borderRadius: '8px',
            backgroundColor: isDarkMode ? 'var(--bg-tertiary)' : '#f9f9f9',
            color: isDarkMode ? 'var(--text-primary)' : '#333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <strong>{type === 'expense' ? item.category : item.source}:</strong>
                {editingTransaction && editingTransaction.id === item.id ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}>
                    {CURRENCY}
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => onEditAmountChange(e.target.value)}
                      style={{ 
                        width: '80px', 
                        margin: '0 8px', 
                        padding: '4px', 
                        border: '1px solid #ccc', 
                        borderRadius: '4px' 
                      }}
                    />
                    <button 
                      onClick={onSaveEdit}
                      style={{ 
                        marginRight: '4px', 
                        padding: '4px 8px', 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={onCancelEdit}
                      style={{ 
                        padding: '4px 8px', 
                        backgroundColor: '#f44336', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={{ marginLeft: '8px' }}>{formatCurrency(item.amount)}</span>
                    <button 
                      onClick={() => onEditTransaction(item, type)}
                      style={{ 
                        marginLeft: '8px', 
                        padding: '4px 8px', 
                        backgroundColor: '#2196F3', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
            {type === 'expense' && item.tags && item.tags.length > 0 && (
              <div style={{ fontSize: '12px', color: isDarkMode ? 'var(--text-secondary)' : '#666', marginTop: '4px' }}>
                Tags: {item.tags.join(', ')}
              </div>
            )}
            {item.description && (
              <div style={{ fontSize: '12px', color: isDarkMode ? 'var(--text-secondary)' : '#666', marginTop: '4px' }}>
                {item.description}
              </div>
            )}
          </li>
        ))}
      </ul>
    )
  ), [editingTransaction, editAmount, onEditTransaction, onCancelEdit, onSaveEdit, onEditAmountChange, isDarkMode]);

  return (
    <div>
      <h2>Transactions Calendar</h2>
      <Calendar onChange={setSelectedDate} value={selectedDate} />
      {selectedDate && (
        <div className="transaction-details" style={{ 
          marginTop: 20, 
          padding: 16, 
          border: isDarkMode ? `1px solid var(--border-color)` : '1px solid #ccc', 
          borderRadius: 8,
          backgroundColor: isDarkMode ? 'var(--bg-secondary)' : '#fff',
          color: isDarkMode ? 'var(--text-primary)' : '#333'
        }}>
          <h3 style={{ color: isDarkMode ? 'var(--text-primary)' : '#333' }}>Details for {selectedDateStr}</h3>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ color: isDarkMode ? 'var(--text-primary)' : '#333' }}>Expenses:</strong>
            {renderTransactionList(transactionsForDate.expenses, 'expense')}
          </div>
          <div>
            <strong style={{ color: isDarkMode ? 'var(--text-primary)' : '#333' }}>Income:</strong>
            {renderTransactionList(transactionsForDate.income, 'income')}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisPage(props) {
  const { expenses, income, colors } = props;
  
  const categoryTotals = useMemo(() => 
    calculateTotals(expenses, 'category'), [expenses]
  );
  
  const chartData = useMemo(() => {
    const allDates = Array.from(new Set([
      ...expenses.map(e => e.date),
      ...income.map(i => i.date)
    ])).sort();
    
    return {
      pie: {
        labels: Object.keys(categoryTotals),
        datasets: [
          {
            data: Object.values(categoryTotals),
            backgroundColor: colors.chartPalette,
            borderColor: colors.border,
            borderWidth: 2
          }
        ]
      },
      bar: {
        labels: allDates,
        datasets: [
          {
            label: 'Expenses',
            data: allDates.map(date =>
              expenses.filter(e => e.date === date).reduce((sum, e) => sum + Number(e.amount), 0)
            ),
            backgroundColor: colors.chartExpense,
            borderColor: colors.chartExpense,
            borderWidth: 1
          },
          {
            label: 'Income',
            data: allDates.map(date =>
              income.filter(i => i.date === date).reduce((sum, i) => sum + Number(i.amount), 0)
            ),
            backgroundColor: colors.chartIncome,
            borderColor: colors.chartIncome,
            borderWidth: 1
          }
        ]
      },
      hasData: Object.keys(categoryTotals).length > 0 || allDates.length > 0
    };
  }, [expenses, income, categoryTotals, colors]);

  // Chart options for theme-aware styling
  const chartOptions = useMemo(() => ({
    pie: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            font: { size: 12 }
          }
        }
      }
    },
    bar: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            font: { size: 12 }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: colors.text },
          grid: { color: colors.border }
        },
        y: {
          ticks: { color: colors.text },
          grid: { color: colors.border }
        }
      }
    }
  }), [colors]);

  const renderNoDataMessage = useCallback((message) => (
    <p style={{ textAlign: 'center', color: colors.text, padding: '40px' }}>
      {message}
    </p>
  ), [colors.text]);

  return (
    <div>
      <h2>Analysis & Trends</h2>
      <div style={{ marginBottom: 40 }}>
        <h3>Expenses by Category</h3>
        {Object.keys(categoryTotals).length === 0 ? (
          renderNoDataMessage('No expense data to display. Add some expenses to see the breakdown.')
        ) : (
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <Pie data={chartData.pie} options={chartOptions.pie} />
          </div>
        )}
      </div>
      <div>
        <h3>Income vs Expenses Over Time</h3>
        {chartData.bar.labels.length === 0 ? (
          renderNoDataMessage('No transaction data to display. Add some income or expenses to see trends.')
        ) : (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Bar data={chartData.bar} options={chartOptions.bar} />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [categories, setCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseForm, setExpenseForm] = useState({});
  const [incomeForm, setIncomeForm] = useState({});
  
  // Edit state
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
    return savedMode === 'true';
  });

  // Memoized theme-based styles and colors
  const colors = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Memoized calculations to avoid repeated computations
  const totals = useMemo(() => {
    const expenseTotals = calculateTotals(expenses, 'category');
    const incomeTotals = calculateTotals(income, 'source');
    const totalIncome = Object.values(incomeTotals).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(expenseTotals).reduce((sum, val) => sum + val, 0);
    
    return {
      expenseTotals,
      incomeTotals,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    };
  }, [expenses, income]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [expData, incData, catData, incCatData] = await fetchAllData();
        setExpenses(expData);
        setIncome(incData);
        setCategories(catData);
        setIncomeCategories(incCatData);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Generic form handlers - consolidated into one function
  const createFormHandler = useCallback((setFormState) => ({
    open: (key) => setFormState(f => ({ ...f, [key]: { open: true, amount: '', tag: '' } })),
    close: (key) => setFormState(f => ({ ...f, [key]: { open: false, amount: '', tag: '' } })),
    change: (key, field, value) => setFormState(f => ({ ...f, [key]: { ...f[key], [field]: value } }))
  }), []);

  const expenseFormHandler = useMemo(() => createFormHandler(setExpenseForm), [createFormHandler]);
  const incomeFormHandler = useMemo(() => createFormHandler(setIncomeForm), [createFormHandler]);

  // Generic transaction handlers
  const createTransactionHandler = useCallback((endpoint, setData, formHandler) => {
    return async (key) => {
      const form = (endpoint === 'expenses' ? expenseForm : incomeForm)[key];
      if (!form?.amount) return;
      
      try {
        const payload = endpoint === 'expenses' 
          ? { amount: form.amount, category: key, date: getLocalDateString(), tags: form.tag ? [form.tag] : [] }
          : { amount: form.amount, source: key, date: getLocalDateString() };
        
        const newTransaction = await apiCall(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        
        setData(prev => [...prev, newTransaction]);
        formHandler.close(key);
      } catch (err) {
        console.error(`Failed to add ${endpoint.slice(0, -1)}:`, err);
      }
    };
  }, [expenseForm, incomeForm]);

  const handleAddExpense = useMemo(() => 
    createTransactionHandler('expenses', setExpenses, expenseFormHandler), 
    [createTransactionHandler, expenseFormHandler]
  );
  
  const handleAddIncome = useMemo(() => 
    createTransactionHandler('income', setIncome, incomeFormHandler), 
    [createTransactionHandler, incomeFormHandler]
  );

  const handleAddIncomeCategory = useCallback(async (name) => {
    try {
      const result = await apiCall('income-categories', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      setIncomeCategories(prev => [...prev, result.name]);
    } catch (err) {
      console.error('Failed to add income category:', err);
    }
  }, []);

  // Edit transaction handlers
  const handleEditTransaction = useCallback((transaction, type) => {
    setEditingTransaction({ ...transaction, type });
    setEditAmount(transaction.amount);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTransaction(null);
    setEditAmount('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingTransaction || !editAmount) return;
    
    try {
      const endpoint = editingTransaction.type === 'expense' ? 'expenses' : 'income';
      const updatedTransaction = await apiCall(`${endpoint}/${editingTransaction.id}`, {
        method: 'PUT',
        body: JSON.stringify({ amount: editAmount })
      });
      
      const setData = editingTransaction.type === 'expense' ? setExpenses : setIncome;
      setData(prev => prev.map(item => 
        item.id === editingTransaction.id ? updatedTransaction : item
      ));
      
      setEditingTransaction(null);
      setEditAmount('');
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  }, [editingTransaction, editAmount]);

  // Dark Mode Handlers
  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode.toString());
  }, [isDarkMode]);

  // Apply theme class to document
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  if (loading) return <div className="app-layout"><main className="main-content"><p>Loading...</p></main></div>;
  if (error) return <div className="app-layout"><main className="main-content"><p style={{color:'red'}}>{error}</p></main></div>;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">💸 No Budget</div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            <span>🏠</span>Home
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            <span>📅</span>Transactions
          </NavLink>
          <NavLink to="/analysis" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            <span>📊</span>Analysis
          </NavLink>
        </nav>

        <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />

        <div className="sidebar-stats">
          <h3>💰 Financial Overview</h3>
          <div className="stat-row">
            <span className="stat-label">Total Income:</span>
            <span className="stat-value income">{formatCurrency(totals.totalIncome)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Expenses:</span>
            <span className="stat-value expense">{formatCurrency(totals.totalExpenses)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Balance:</span>
            <span className={`stat-value ${totals.balance >= 0 ? 'income' : 'expense'}`}>
              {formatCurrency(totals.balance)}
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Categories:</span>
            <span className="stat-value">{categories.length}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Transactions:</span>
            <span className="stat-value">{expenses.length + income.length}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ marginBottom: 10, color: colors.text }}>Base Currency: <strong>HKD</strong></div>
        <Routes>
          <Route path="/" element={
            <HomePage
              categories={categories}
              expenseTotals={totals.expenseTotals}
              expenseForm={expenseForm}
              incomeCategories={incomeCategories}
              incomeTotals={totals.incomeTotals}
              incomeForm={incomeForm}
              onExpenseFormChange={expenseFormHandler.change}
              onIncomeFormChange={incomeFormHandler.change}
              onOpenExpenseForm={expenseFormHandler.open}
              onCloseExpenseForm={expenseFormHandler.close}
              onOpenIncomeForm={incomeFormHandler.open}
              onCloseIncomeForm={incomeFormHandler.close}
              onAddExpense={handleAddExpense}
              onAddIncome={handleAddIncome}
              onAddIncomeCategory={handleAddIncomeCategory}
              styles={styles}
              colors={colors}
            />
          } />
          <Route path="/transactions" element={
            <TransactionsPage 
              expenses={expenses} 
              income={income}
              editingTransaction={editingTransaction}
              editAmount={editAmount}
              onEditTransaction={handleEditTransaction}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onEditAmountChange={setEditAmount}
              isDarkMode={isDarkMode}
            />
          } />
          <Route path="/analysis" element={
            <AnalysisPage expenses={expenses} income={income} colors={colors} />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;