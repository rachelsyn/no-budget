import './App.css';
import { useEffect, useState, useMemo } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
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

// Utility functions
const getLocalDateString = () => {
  const today = new Date();
  return today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
};

const formatCurrency = (amount) => `HK$${Number(amount).toFixed(2)}`;

const calculateTotals = (items, groupBy, amountKey = 'amount') => {
  return items.reduce((acc, item) => {
    const key = item[groupBy];
    acc[key] = (acc[key] || 0) + Number(item[amountKey]);
    return acc;
  }, {});
};

// Constants
const FORM_INPUT_STYLE = { 
  marginBottom: 6, 
  width: '100%', 
  borderRadius: 6, 
  border: '1px solid #ccc', 
  padding: 6 
};

const BUTTON_STYLE = {
  primary: { background: '#36A2EB', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px' },
  secondary: { background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '4px 12px' },
  expense: { fontSize: 14, padding: '4px 12px', borderRadius: 8, border: 'none', background: '#0FA3B1', color: '#fff', cursor: 'pointer', marginBottom: 4 },
  income: { fontSize: 14, padding: '4px 12px', borderRadius: 8, border: 'none', background: '#F7A072', color: '#fff', cursor: 'pointer', marginBottom: 4 }
};

// Icon mappings
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

const getIcon = (name, type = 'expense') => {
  if (type === 'expense') {
    return CATEGORY_ICONS[name] || '💸';
  }
  // Income icon logic
  if (/salary/i.test(name)) return '💼';
  if (/freelance/i.test(name)) return '🧑‍💻';
  if (/bonus/i.test(name)) return '🎁';
  return '💰';
};

// Reusable Form Component
function TransactionForm({ isOpen, type, category, form, onFormChange, onSubmit, onClose }) {
  if (!isOpen) return null;
  
  const isExpense = type === 'expense';
  
  return (
    <div style={{ marginTop: 10, width: '100%' }}>
      <input
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={e => onFormChange('amount', e.target.value)}
        style={FORM_INPUT_STYLE}
      />
      {isExpense && (
        <input
          type="text"
          placeholder="Tag (e.g. breakfast)"
          value={form.tag}
          onChange={e => onFormChange('tag', e.target.value)}
          style={FORM_INPUT_STYLE}
        />
      )}
      <div>
        <button onClick={onSubmit} style={{ ...BUTTON_STYLE.primary, marginRight: 8 }}>Add</button>
        <button onClick={onClose} style={BUTTON_STYLE.secondary}>Cancel</button>
      </div>
    </div>
  );
}

// Reusable Card Component
function TransactionCard({ category, total, icon, color, type, form, onOpenForm, onFormChange, onSubmit, onCloseForm }) {
  const cardClass = type === 'expense' ? 'card-expense' : 'card-income';
  const buttonStyle = type === 'expense' ? BUTTON_STYLE.expense : BUTTON_STYLE.income;
  
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
    onAddExpense, onAddIncome, onAddIncomeCategory
  } = props;
  
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  
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
              color="#0FA3B1"
              type="expense"
              form={expenseForm[cat]}
              onOpenForm={onOpenExpenseForm}
              onFormChange={onExpenseFormChange}
              onSubmit={onAddExpense}
              onCloseForm={onCloseExpenseForm}
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
            style={{ borderRadius: 6, border: '1px solid #ccc', padding: 6 }}
          />
          <button
            onClick={() => {
              if (newIncomeCategory.trim()) {
                onAddIncomeCategory(newIncomeCategory.trim());
                setNewIncomeCategory('');
              }
            }}
            style={{ background: '#F7A072', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px' }}
          >
            Add
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {incomeCategories.length === 0 && (
            <div style={{ color: '#888' }}>No income categories yet</div>
          )}
          {incomeCategories.slice(0, 9).map(src => (
            <TransactionCard
              key={src}
              category={src}
              total={incomeTotals[src]}
              icon={getIcon(src, 'income')}
              color="#F7A072"
              type="income"
              form={incomeForm[src]}
              onOpenForm={onOpenIncomeForm}
              onFormChange={onIncomeFormChange}
              onSubmit={onAddIncome}
              onCloseForm={onCloseIncomeForm}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function TransactionsPage(props) {
  const { expenses, income } = props;
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

  const renderTransactionList = (items, type) => (
    items.length === 0 ? (
      <p>None</p>
    ) : (
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {type === 'expense' ? item.category : item.source}: {formatCurrency(item.amount)}
            {type === 'expense' && item.tags && item.tags.length > 0 && ` [${item.tags.join(', ')}]`}
            {item.description && ` - ${item.description}`}
          </li>
        ))}
      </ul>
    )
  );

  return (
    <div>
      <h2>Transactions Calendar</h2>
      <Calendar onChange={setSelectedDate} value={selectedDate} />
      {selectedDate && (
        <div style={{ marginTop: 20, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>Details for {selectedDateStr}</h3>
          <div>
            <strong>Expenses:</strong>
            {renderTransactionList(transactionsForDate.expenses, 'expense')}
          </div>
          <div>
            <strong>Income:</strong>
            {renderTransactionList(transactionsForDate.income, 'income')}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisPage(props) {
  const { expenses, income } = props;
  
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
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
              '#FF9F40', '#4BC0C0', '#9966FF'
            ]
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
            backgroundColor: '#FF6384'
          },
          {
            label: 'Income',
            data: allDates.map(date =>
              income.filter(i => i.date === date).reduce((sum, i) => sum + Number(i.amount), 0)
            ),
            backgroundColor: '#36A2EB'
          }
        ]
      },
      hasData: Object.keys(categoryTotals).length > 0 || allDates.length > 0
    };
  }, [expenses, income, categoryTotals]);

  const renderNoDataMessage = (message) => (
    <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
      {message}
    </p>
  );

  return (
    <div>
      <h2>Analysis & Trends</h2>
      <div style={{ marginBottom: 40 }}>
        <h3>Expenses by Category</h3>
        {Object.keys(categoryTotals).length === 0 ? (
          renderNoDataMessage('No expense data to display. Add some expenses to see the breakdown.')
        ) : (
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <Pie data={chartData.pie} />
          </div>
        )}
      </div>
      <div>
        <h3>Income vs Expenses Over Time</h3>
        {chartData.bar.labels.length === 0 ? (
          renderNoDataMessage('No transaction data to display. Add some income or expenses to see trends.')
        ) : (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Bar data={chartData.bar} />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [categories, setCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseForm, setExpenseForm] = useState({});
  const [incomeForm, setIncomeForm] = useState({});

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
        const [expRes, incRes, catRes, incCatRes] = await Promise.all([
          fetch('http://localhost:5001/api/expenses'),
          fetch('http://localhost:5001/api/income'),
          fetch('http://localhost:5001/api/categories'),
          fetch('http://localhost:5001/api/income-categories')
        ]);
        const [expData, incData, catData, incCatData] = await Promise.all([
          expRes.json(),
          incRes.json(),
          catRes.json(),
          incCatRes.json()
        ]);
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

  // Generic form handlers
  const createFormHandler = (setFormState) => ({
    open: (key) => setFormState(f => ({ ...f, [key]: { open: true, amount: '', tag: '' } })),
    close: (key) => setFormState(f => ({ ...f, [key]: { open: false, amount: '', tag: '' } })),
    change: (key, field, value) => setFormState(f => ({ ...f, [key]: { ...f[key], [field]: value } }))
  });

  const expenseFormHandler = createFormHandler(setExpenseForm);
  const incomeFormHandler = createFormHandler(setIncomeForm);

  // Generic API call function
  const makeApiCall = async (endpoint, data) => {
    const response = await fetch(`http://localhost:5001/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('API call failed');
    return response.json();
  };

  // Transaction handlers
  const handleAddExpense = async (category) => {
    const form = expenseForm[category];
    if (!form?.amount) return;
    
    try {
      const newExpense = await makeApiCall('expenses', {
        amount: form.amount,
        category,
        date: getLocalDateString(),
        tags: form.tag ? [form.tag] : []
      });
      setExpenses(prev => [...prev, newExpense]);
      expenseFormHandler.close(category);
    } catch (err) {
      console.error('Failed to add expense:', err);
    }
  };

  const handleAddIncome = async (source) => {
    const form = incomeForm[source];
    if (!form?.amount) return;
    
    try {
      const newIncome = await makeApiCall('income', {
        amount: form.amount,
        source,
        date: getLocalDateString()
      });
      setIncome(prev => [...prev, newIncome]);
      incomeFormHandler.close(source);
    } catch (err) {
      console.error('Failed to add income:', err);
    }
  };

  const handleAddIncomeCategory = async (name) => {
    try {
      const result = await makeApiCall('income-categories', { name });
      setIncomeCategories(prev => [...prev, result.name]);
    } catch (err) {
      console.error('Failed to add income category:', err);
    }
  };

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
        <div style={{ marginBottom: 10, color: '#888' }}>Base Currency: <strong>HKD</strong></div>
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
            />
          } />
          <Route path="/transactions" element={
            <TransactionsPage expenses={expenses} income={income} />
          } />
          <Route path="/analysis" element={
            <AnalysisPage expenses={expenses} income={income} />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
