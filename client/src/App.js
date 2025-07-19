import './App.css';
import { useEffect, useState } from 'react';
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

function HomePage(props) {
  // All the dashboard logic and UI from the previous App return (except calendar)
  const { categories, expenseTotals, openExpenseForm, expenseForm, setExpenseForm, handleAddExpense, closeExpenseForm, getCategoryIcon, incomeTotals, incomeCategories, openIncomeForm, incomeForm, setIncomeForm, handleAddIncome, closeIncomeForm, getSourceIcon, handleAddIncomeCategory } = props;
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  return (
    <>
      {/* Expenses Row */}
      <div style={{ marginBottom: 40 }}>
        <h2>Expenses</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {categories.slice(0, 9).map(cat => (
            <div key={cat} className="card-expense">
              <div style={{ fontSize: 36, marginBottom: 8 }}>{getCategoryIcon(cat)}</div>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>{cat}</div>
              <div style={{ fontSize: 22, color: '#0FA3B1', fontWeight: 700, marginBottom: 8 }}>HK${expenseTotals[cat]?.toFixed(2) || '0.00'}</div>
              <button onClick={() => openExpenseForm(cat)} style={{ fontSize: 14, padding: '4px 12px', borderRadius: 8, border: 'none', background: '#0FA3B1', color: '#fff', cursor: 'pointer', marginBottom: 4 }}>Add</button>
              {expenseForm[cat]?.open && (
                <div style={{ marginTop: 10, width: '100%' }}>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={expenseForm[cat].amount}
                    onChange={e => setExpenseForm(f => ({ ...f, [cat]: { ...f[cat], amount: e.target.value } }))}
                    style={{ marginBottom: 6, width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 6 }}
                  />
                  <input
                    type="text"
                    placeholder="Tag (e.g. breakfast)"
                    value={expenseForm[cat].tag}
                    onChange={e => setExpenseForm(f => ({ ...f, [cat]: { ...f[cat], tag: e.target.value } }))}
                    style={{ marginBottom: 6, width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 6 }}
                  />
                  <div>
                    <button onClick={() => handleAddExpense(cat)} style={{ marginRight: 8, background: '#36A2EB', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px' }}>Add</button>
                    <button onClick={() => closeExpenseForm(cat)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '4px 12px' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Income Row */}
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
                handleAddIncomeCategory(newIncomeCategory.trim());
                setNewIncomeCategory('');
              }
            }}
            style={{ background: '#F7A072', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px' }}
          >
            Add
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {incomeCategories.slice(0, 9).length === 0 && (
            <div style={{ color: '#888' }}>No income categories yet</div>
          )}
          {incomeCategories.slice(0, 9).map(src => (
            <div key={src} className="card-income">
              <div style={{ fontSize: 36, marginBottom: 8 }}>{getSourceIcon(src)}</div>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>{src}</div>
              <div style={{ fontSize: 22, color: '#F7A072', fontWeight: 700, marginBottom: 8 }}>HK${incomeTotals[src]?.toFixed(2) || '0.00'}</div>
              <button onClick={() => openIncomeForm(src)} style={{ fontSize: 14, padding: '4px 12px', borderRadius: 8, border: 'none', background: '#F7A072', color: '#fff', cursor: 'pointer', marginBottom: 4 }}>Add</button>
              {incomeForm[src]?.open && (
                <div style={{ marginTop: 10, width: '100%' }}>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={incomeForm[src].amount}
                    onChange={e => setIncomeForm(f => ({ ...f, [src]: { ...f[src], amount: e.target.value } }))}
                    style={{ marginBottom: 6, width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 6 }}
                  />
                  <div>
                    <button onClick={() => handleAddIncome(src)} style={{ marginRight: 8, background: '#0FA3B1', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px' }}>Add</button>
                    <button onClick={() => closeIncomeForm(src)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '4px 12px' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TransactionsPage(props) {
  // Calendar and daily details logic from previous App (with expenses/income for selected date)
  const { expenses, income } = props;
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Fix timezone issue by using local date instead of UTC
  const selectedDateStr = selectedDate ? 
    selectedDate.getFullYear() + '-' + 
    String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
    String(selectedDate.getDate()).padStart(2, '0') : null;
    
  const expensesForDate = selectedDateStr ? expenses.filter(e => e.date === selectedDateStr) : [];
  const incomeForDate = selectedDateStr ? income.filter(i => i.date === selectedDateStr) : [];
  return (
    <div>
      <h2>Transactions Calendar</h2>
      <Calendar onChange={setSelectedDate} value={selectedDate} />
      {selectedDate && (
        <div style={{ marginTop: 20, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>Details for {selectedDateStr}</h3>
          <div>
            <strong>Expenses:</strong>
            {expensesForDate.length === 0 ? (
              <p>None</p>
            ) : (
              <ul>
                {expensesForDate.map(e => (
                  <li key={e.id}>{e.category}: HK${e.amount} {e.tags && e.tags.length > 0 && `[${e.tags.join(', ')}]`} {e.description && `- ${e.description}`}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <strong>Income:</strong>
            {incomeForDate.length === 0 ? (
              <p>None</p>
            ) : (
              <ul>
                {incomeForDate.map(i => (
                  <li key={i.id}>{i.source}: HK${i.amount} {i.description && `- ${i.description}`}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisPage(props) {
  const { expenses, income } = props;
  
  // Pie chart: Expenses by category
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});
  
  const pieData = {
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
  };
  
  // Bar chart: Income vs Expenses by date
  const allDates = Array.from(new Set([
    ...expenses.map(e => e.date),
    ...income.map(i => i.date)
  ])).sort();
  
  const expenseByDate = allDates.map(date =>
    expenses.filter(e => e.date === date).reduce((sum, e) => sum + Number(e.amount), 0)
  );
  const incomeByDate = allDates.map(date =>
    income.filter(i => i.date === date).reduce((sum, i) => sum + Number(i.amount), 0)
  );
  
  const barData = {
    labels: allDates,
    datasets: [
      {
        label: 'Expenses',
        data: expenseByDate,
        backgroundColor: '#FF6384'
      },
      {
        label: 'Income',
        data: incomeByDate,
        backgroundColor: '#36A2EB'
      }
    ]
  };

  return (
    <div>
      <h2>Analysis & Trends</h2>
      <div style={{ marginBottom: 40 }}>
        <h3>Expenses by Category</h3>
        {Object.keys(categoryTotals).length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            No expense data to display. Add some expenses to see the breakdown.
          </p>
        ) : (
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <Pie data={pieData} />
          </div>
        )}
      </div>
      <div>
        <h3>Income vs Expenses Over Time</h3>
        {allDates.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            No transaction data to display. Add some income or expenses to see trends.
          </p>
        ) : (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Bar data={barData} />
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseForm, setExpenseForm] = useState({}); // { [category]: { open: bool, amount: '', tag: '' } }
  const [incomeForm, setIncomeForm] = useState({}); // { [source]: { open: bool, amount: '' } }
  const [incomeCategories, setIncomeCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [expRes, incRes, catRes, incCatRes] = await Promise.all([
          fetch('http://localhost:5001/api/expenses'),
          fetch('http://localhost:5001/api/income'),
          fetch('http://localhost:5001/api/categories'),
          fetch('http://localhost:5001/api/income-categories')
        ]);
        const expData = await expRes.json();
        const incData = await incRes.json();
        const catData = await catRes.json();
        const incCatData = await incCatRes.json();
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

  // Expense totals by category
  const expenseTotals = categories.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + Number(e.amount), 0);
    return acc;
  }, {});

  // Income totals by source
  const sources = Array.from(new Set(income.map(i => i.source)));
  const incomeTotals = sources.reduce((acc, src) => {
    acc[src] = income.filter(i => i.source === src).reduce((sum, i) => sum + Number(i.amount), 0);
    return acc;
  }, {});

  // Handle expense form open/close
  const openExpenseForm = cat => setExpenseForm(f => ({ ...f, [cat]: { open: true, amount: '', tag: '' } }));
  const closeExpenseForm = cat => setExpenseForm(f => ({ ...f, [cat]: { open: false, amount: '', tag: '' } }));
  // Handle income form open/close
  const openIncomeForm = src => setIncomeForm(f => ({ ...f, [src]: { open: true, amount: '' } }));
  const closeIncomeForm = src => setIncomeForm(f => ({ ...f, [src]: { open: false, amount: '' } }));

  // Add expense
  async function handleAddExpense(cat) {
    const { amount, tag } = expenseForm[cat];
    if (!amount) return;
    
    // Use local date to avoid timezone issues
    const today = new Date();
    const localDateStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
      
    const res = await fetch('http://localhost:5001/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category: cat, date: localDateStr, tags: tag ? [tag] : [] })
    });
    if (res.ok) {
      const newExp = await res.json();
      setExpenses(e => [...e, newExp]);
      closeExpenseForm(cat);
    }
  }

  // Add income
  async function handleAddIncome(src) {
    const { amount } = incomeForm[src];
    if (!amount) return;
    
    // Use local date to avoid timezone issues
    const today = new Date();
    const localDateStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
      
    const res = await fetch('http://localhost:5001/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, source: src, date: localDateStr })
    });
    if (res.ok) {
      const newInc = await res.json();
      setIncome(i => [...i, newInc]);
      closeIncomeForm(src);
    }
  }

  // Add income category
  async function handleAddIncomeCategory(name) {
    const res = await fetch('http://localhost:5001/api/income-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      const { name: newName } = await res.json();
      setIncomeCategories(cats => [...cats, newName]);
    }
  }

  // Icon mapping for categories and sources
  const categoryIcons = {
    'Food': '🍔',
    'Meals': '🍽️',
    'Transport': '🚗',
    'Transportation': '🚌',
    'Shopping': '🛍️',
    'Bills': '💡',
    'Entertainment': '🎬',
    'Other': '📦',
  };
  const defaultExpenseIcon = '💸';
  const defaultIncomeIcon = '💰';

  function getCategoryIcon(cat) {
    return categoryIcons[cat] || defaultExpenseIcon;
  }
  function getSourceIcon(src) {
    // You can expand this mapping for income sources
    if (/salary/i.test(src)) return '💼';
    if (/freelance/i.test(src)) return '🧑‍💻';
    if (/bonus/i.test(src)) return '🎁';
    return defaultIncomeIcon;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">💸 No Budget</div>
        
        {/* Navigation */}
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

        {/* Quick Stats */}
        <div className="sidebar-stats">
          <h3>💰 Financial Overview</h3>
          <div className="stat-row">
            <span className="stat-label">Total Income:</span>
            <span className="stat-value income">HK${Object.values(incomeTotals).reduce((sum, val) => sum + val, 0).toFixed(2)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Expenses:</span>
            <span className="stat-value expense">HK${Object.values(expenseTotals).reduce((sum, val) => sum + val, 0).toFixed(2)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Balance:</span>
            <span className={`stat-value ${Object.values(incomeTotals).reduce((sum, val) => sum + val, 0) - Object.values(expenseTotals).reduce((sum, val) => sum + val, 0) >= 0 ? 'income' : 'expense'}`}>
              HK${(Object.values(incomeTotals).reduce((sum, val) => sum + val, 0) - Object.values(expenseTotals).reduce((sum, val) => sum + val, 0)).toFixed(2)}
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

        {/* Quick Actions */}
        <div className="sidebar-quick-actions">
          <h3>⚡ Quick Actions</h3>
          <button className="quick-action-btn" onClick={() => {
            // Find most used expense category or default to first available
            let mostUsedCategory = categories.length > 0 ? categories[0] : null;
            if (categories.length > 0) {
              mostUsedCategory = categories.reduce((max, cat) => 
                (expenseTotals[cat] || 0) > (expenseTotals[max] || 0) ? cat : max
              );
            }
            if (mostUsedCategory) {
              openExpenseForm(mostUsedCategory);
            } else {
              alert('No expense categories available. Please add some categories first.');
            }
          }}>
            <span>🛒</span>Quick Expense
          </button>
          <button className="quick-action-btn" onClick={() => {
            // Find most used income source or default to first available
            let mostUsedSource = incomeCategories.length > 0 ? incomeCategories[0] : null;
            if (incomeCategories.length > 0) {
              mostUsedSource = incomeCategories.reduce((max, src) => 
                (incomeTotals[src] || 0) > (incomeTotals[max] || 0) ? src : max
              );
            }
            if (mostUsedSource) {
              openIncomeForm(mostUsedSource);
            } else {
              alert('No income categories available. Please add some income categories first.');
            }
          }}>
            <span>💵</span>Add Income
          </button>
          <button className="quick-action-btn" onClick={() => {
            // Navigate using React Router (need to use navigate hook in a real app)
            // For now, let's scroll to analysis or show an alert
            alert('Please use the "Analysis" tab in the sidebar to view trends and charts.');
          }}>
            <span>📈</span>View Trends
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div style={{ marginBottom: 10, color: '#888' }}>Base Currency: <strong>HKD</strong></div>
        {loading ? <p>Loading...</p> : error ? <p style={{color:'red'}}>{error}</p> : (
          <Routes>
            <Route path="/" element={
              <HomePage
                categories={categories}
                expenseTotals={expenseTotals}
                openExpenseForm={openExpenseForm}
                expenseForm={expenseForm}
                setExpenseForm={setExpenseForm}
                handleAddExpense={handleAddExpense}
                closeExpenseForm={closeExpenseForm}
                getCategoryIcon={getCategoryIcon}
                incomeTotals={incomeTotals}
                incomeCategories={incomeCategories}
                openIncomeForm={openIncomeForm}
                incomeForm={incomeForm}
                setIncomeForm={setIncomeForm}
                handleAddIncome={handleAddIncome}
                closeIncomeForm={closeIncomeForm}
                getSourceIcon={getSourceIcon}
                handleAddIncomeCategory={handleAddIncomeCategory}
              />
            } />
            <Route path="/transactions" element={
              <TransactionsPage expenses={expenses} income={income} />
            } />
            <Route path="/analysis" element={
              <AnalysisPage expenses={expenses} income={income} />
            } />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default App;
