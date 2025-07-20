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
const API_BASE_URL = '/api'; // Use relative path for both development and production
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

const ENTITY_CONFIGS = {
  expenses: {
    keyField: 'category',
    amountField: 'amount',
    endpoint: 'expenses',
    hasTag: true,
    type: 'expense',
    icons: {
      'Food': '🍔', 'Meals': '🍽️', 'Transport': '🚗', 'Transportation': '🚌',
      'Shopping': '🛍️', 'Bills': '💡', 'Entertainment': '🎬', 'Other': '📦'
    },
    defaultIcon: '💸'
  },
  income: {
    keyField: 'source',
    amountField: 'amount',
    endpoint: 'income',
    hasTag: false,
    type: 'income',
    patterns: [
      { pattern: /salary/i, icon: '💼' },
      { pattern: /freelance/i, icon: '🧑‍💻' },
      { pattern: /bonus/i, icon: '🎁' }
    ],
    defaultIcon: '💰'
  }
};

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

const getIcon = (name, entityType = 'expenses') => {
  const config = ENTITY_CONFIGS[entityType];
  
  if (config.icons) {
    return config.icons[name] || config.defaultIcon;
  }
  
  if (config.patterns) {
    for (const { pattern, icon } of config.patterns) {
      if (pattern.test(name)) return icon;
    }
  }
  
  return config.defaultIcon;
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

// Generic API utilities
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

const createApiOperations = (endpoint) => ({
  getAll: () => apiCall(endpoint),
  create: (data) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`${endpoint}/${id}`, { method: 'DELETE' })
});

// Custom hooks
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  });
  
  const setStoredValue = useCallback((newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  }, [key]);
  
  return [value, setStoredValue];
};

const useEntityData = (entityType) => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const config = ENTITY_CONFIGS[entityType];
  const api = createApiOperations(config.endpoint);
  const categoryEndpoint = entityType === 'expenses' ? 'categories' : 'income-categories';
  const categoryApi = createApiOperations(categoryEndpoint);
  
  const fetchData = useCallback(async () => {
    try {
      const [dataResult, categoriesResult] = await Promise.all([
        api.getAll(),
        categoryApi.getAll()
      ]);
      setData(dataResult);
      setCategories(categoriesResult);
    } catch (err) {
      setError(`Failed to fetch ${entityType} data`);
    } finally {
      setLoading(false);
    }
  }, [api, categoryApi, entityType]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const addItem = useCallback(async (itemData) => {
    try {
      const newItem = await api.create(itemData);
      setData(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      throw new Error(`Failed to add ${entityType.slice(0, -1)}: ${err.message}`);
    }
  }, [api, entityType]);
  
  const updateItem = useCallback(async (id, itemData) => {
    try {
      const updatedItem = await api.update(id, itemData);
      setData(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      throw new Error(`Failed to update ${entityType.slice(0, -1)}: ${err.message}`);
    }
  }, [api, entityType]);
  
  const addCategory = useCallback(async (name) => {
    try {
      const result = await categoryApi.create({ name });
      setCategories(prev => [...prev, result.name]);
      return result;
    } catch (err) {
      throw new Error(`Failed to add category: ${err.message}`);
    }
  }, [categoryApi]);
  
  return {
    data,
    categories,
    loading,
    error,
    addItem,
    updateItem,
    addCategory,
    totals: useMemo(() => calculateTotals(data, config.keyField), [data, config.keyField])
  };
};

const useFormManager = () => {
  const [forms, setForms] = useState({});
  
  const createFormHandler = useCallback((formType) => ({
    open: (key) => setForms(f => ({ ...f, [`${formType}_${key}`]: { 
      open: true, amount: '', tag: '', date: getLocalDateString() 
    }})),
    close: (key) => setForms(f => ({ ...f, [`${formType}_${key}`]: { 
      open: false, amount: '', tag: '', date: getLocalDateString() 
    }})),
    change: (key, field, value) => setForms(f => ({ 
      ...f, 
      [`${formType}_${key}`]: { ...f[`${formType}_${key}`], [field]: value } 
    })),
    get: (key) => forms[`${formType}_${key}`] || { open: false, amount: '', tag: '', date: getLocalDateString() }
  }), [forms]);
  
  return createFormHandler;
};

const useTransactionEditor = () => {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  
  const editTransaction = useCallback((transaction, type) => {
    setEditingTransaction({ ...transaction, type });
    setEditAmount(transaction.amount);
  }, []);
  
  const cancelEdit = useCallback(() => {
    setEditingTransaction(null);
    setEditAmount('');
  }, []);
  
  return {
    editingTransaction,
    editAmount,
    setEditAmount,
    editTransaction,
    cancelEdit,
    saveEdit: null // Will be set by the component using this hook
  };
};

// Components
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

function TransactionForm({ isOpen, entityType, category, form, onFormChange, onSubmit, onClose, styles }) {
  if (!isOpen) return null;
  
  const config = ENTITY_CONFIGS[entityType];
  
  return (
    <div style={{ marginTop: 10, width: '100%' }}>
      <input
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={e => onFormChange('amount', e.target.value)}
        style={styles.formInput}
      />
      <input
        type="date"
        value={form.date || getLocalDateString()}
        onChange={e => onFormChange('date', e.target.value)}
        style={styles.formInput}
        title="Select transaction date"
      />
      {config.hasTag && (
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

function TransactionCard({ 
  entityType, category, total, onOpenForm, onFormChange, onSubmit, onCloseForm, 
  formHandler, styles, colors 
}) {
  const config = ENTITY_CONFIGS[entityType];
  const form = formHandler.get(category);
  const icon = getIcon(category, entityType);
  const cardClass = `card-${config.type}`;
  const buttonStyle = styles.button[config.type];
  const color = colors[config.type];
  
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
        entityType={entityType}
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

function EntitySection({ 
  entityType, title, data, onAddItem, onAddCategory, 
  formHandler, styles, colors 
}) {
  const { categories, totals } = data;
  const [newCategory, setNewCategory] = useState('');
  const config = ENTITY_CONFIGS[entityType];
  
  const handleAddCategory = useCallback(async () => {
    if (newCategory.trim()) {
      try {
        await onAddCategory(newCategory.trim());
        setNewCategory('');
      } catch (err) {
        console.error(err.message);
      }
    }
  }, [newCategory, onAddCategory]);
  
  const handleAddItem = useCallback(async (category) => {
    const form = formHandler.get(category);
    if (!form?.amount) return;
    
    try {
      const selectedDate = form.date || getLocalDateString();
      const payload = {
        amount: form.amount,
        [config.keyField]: category,
        date: selectedDate,
        ...(config.hasTag && form.tag && { tags: [form.tag] })
      };
      
      await onAddItem(payload);
      formHandler.close(category);
    } catch (err) {
      console.error(err.message);
    }
  }, [formHandler, onAddItem, config]);
  
  return (
    <div style={{ marginBottom: 40 }}>
      <h2>{title}</h2>
      {entityType === 'income' && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder={`Add ${title.toLowerCase()} category`}
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            style={styles.formInput}
          />
          <button onClick={handleAddCategory} style={styles.button[config.type]}>
            Add
          </button>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {categories.length === 0 && entityType === 'income' && (
          <div style={{ color: colors.text }}>No {title.toLowerCase()} categories yet</div>
        )}
        {categories.slice(0, 9).map(cat => (
          <TransactionCard
            key={cat}
            entityType={entityType}
            category={cat}
            total={totals[cat]}
            onOpenForm={formHandler.open}
            onFormChange={formHandler.change}
            onSubmit={handleAddItem}
            onCloseForm={formHandler.close}
            formHandler={formHandler}
            styles={styles}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
}

// Page Components
function HomePage({ expenseData, incomeData, formHandlers, styles, colors }) {
  return (
    <>
      <EntitySection
        entityType="expenses"
        title="Expenses"
        data={expenseData}
        onAddItem={expenseData.addItem}
        onAddCategory={expenseData.addCategory}
        formHandler={formHandlers.expense}
        styles={styles}
        colors={colors}
      />
      <EntitySection
        entityType="income"
        title="Income"
        data={incomeData}
        onAddItem={incomeData.addItem}
        onAddCategory={incomeData.addCategory}
        formHandler={formHandlers.income}
        styles={styles}
        colors={colors}
      />
    </>
  );
}

function TransactionsPage(props) {
  const { 
    expenseData, incomeData, editor, isDarkMode
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
      expenses: expenseData.data.filter(e => e.date === selectedDateStr),
      income: incomeData.data.filter(i => i.date === selectedDateStr)
    };
  }, [expenseData.data, incomeData.data, selectedDateStr]);

  const renderTransactionList = useCallback((items, entityType) => (
    items.length === 0 ? (
      <p>None</p>
    ) : (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => {
          const config = ENTITY_CONFIGS[entityType];
          const keyValue = item[config.keyField];
          
          return (
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
                  <strong>{keyValue}:</strong>
                  {editor.editingTransaction && editor.editingTransaction.id === item.id ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}>
                      {CURRENCY}
                      <input
                        type="number"
                        value={editor.editAmount}
                        onChange={(e) => editor.setEditAmount(e.target.value)}
                        style={{ 
                          width: '80px', 
                          margin: '0 8px', 
                          padding: '4px', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px' 
                        }}
                      />
                      <button 
                        onClick={() => editor.saveEdit(item, entityType)}
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
                        onClick={editor.cancelEdit}
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
                        onClick={() => editor.editTransaction(item, entityType)}
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
              {entityType === 'expenses' && item.tags && item.tags.length > 0 && (
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
          );
        })}
      </ul>
    )
  ), [editor, isDarkMode]);

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
            {renderTransactionList(transactionsForDate.expenses, 'expenses')}
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

function AnalysisPage({ expenseData, incomeData, colors }) {
  const chartData = useMemo(() => {
    const allDates = Array.from(new Set([
      ...expenseData.data.map(e => e.date),
      ...incomeData.data.map(i => i.date)
    ])).sort();
    
    return {
      pie: {
        labels: Object.keys(expenseData.totals),
        datasets: [
          {
            data: Object.values(expenseData.totals),
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
              expenseData.data.filter(e => e.date === date).reduce((sum, e) => sum + Number(e.amount), 0)
            ),
            backgroundColor: colors.chartExpense,
            borderColor: colors.chartExpense,
            borderWidth: 1
          },
          {
            label: 'Income',
            data: allDates.map(date =>
              incomeData.data.filter(i => i.date === date).reduce((sum, i) => sum + Number(i.amount), 0)
            ),
            backgroundColor: colors.chartIncome,
            borderColor: colors.chartIncome,
            borderWidth: 1
          }
        ]
      },
      hasData: Object.keys(expenseData.totals).length > 0 || allDates.length > 0
    };
  }, [expenseData, incomeData, colors]);

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
        {Object.keys(expenseData.totals).length === 0 ? (
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
  // Theme state
  const [isDarkMode, toggleDarkMode] = useLocalStorage(THEME_STORAGE_KEY, false);
  
  // Data hooks
  const expenseData = useEntityData('expenses');
  const incomeData = useEntityData('income');
  
  // Form management
  const createFormHandler = useFormManager();
  const formHandlers = {
    expense: createFormHandler('expense'),
    income: createFormHandler('income')
  };
  
  // Transaction editing
  const editor = useTransactionEditor();
  
  // Set up editor save function
  editor.saveEdit = useCallback(async (item, entityType) => {
    if (!editor.editingTransaction || !editor.editAmount) return;
    
    try {
      const updateData = { amount: editor.editAmount };
      const dataHook = entityType === 'expenses' ? expenseData : incomeData;
      await dataHook.updateItem(editor.editingTransaction.id, updateData);
      editor.cancelEdit();
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  }, [editor, expenseData, incomeData]);

  // Memoized theme-based styles and colors
  const colors = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Memoized calculations to avoid repeated computations
  const totals = useMemo(() => {
    const totalIncome = Object.values(incomeData.totals).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(expenseData.totals).reduce((sum, val) => sum + val, 0);
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    };
  }, [expenseData.totals, incomeData.totals]);

  // Apply theme class to document
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  if (expenseData.loading || incomeData.loading) {
    return <div className="app-layout"><main className="main-content"><p>Loading...</p></main></div>;
  }
  
  if (expenseData.error || incomeData.error) {
    return (
      <div className="app-layout">
        <main className="main-content">
          <p style={{color:'red'}}>{expenseData.error || incomeData.error}</p>
        </main>
      </div>
    );
  }

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

        <DarkModeToggle isDarkMode={isDarkMode} onToggle={() => toggleDarkMode(!isDarkMode)} />

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
            <span className="stat-value">{expenseData.categories.length}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Transactions:</span>
            <span className="stat-value">{expenseData.data.length + incomeData.data.length}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ marginBottom: 10, color: colors.text }}>Base Currency: <strong>HKD</strong></div>
        <Routes>
          <Route path="/" element={
            <HomePage
              expenseData={expenseData}
              incomeData={incomeData}
              formHandlers={formHandlers}
              styles={styles}
              colors={colors}
            />
          } />
          <Route path="/transactions" element={
            <TransactionsPage 
              expenseData={expenseData}
              incomeData={incomeData}
              editor={editor}
              isDarkMode={isDarkMode}
            />
          } />
          <Route path="/analysis" element={
            <AnalysisPage 
              expenseData={expenseData}
              incomeData={incomeData}
              colors={colors}
            />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;