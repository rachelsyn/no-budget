const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files from the React app (only in production)
const buildPath = path.join(__dirname, 'client', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// Generic file operations
const createFileHandler = (filename, defaultData = []) => {
  const filePath = path.join(__dirname, filename);
  
  return {
    read: () => {
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      } catch (err) {
        console.error(`Error reading ${filename}:`, err.message);
        return defaultData;
      }
    },
    write: (data) => {
      try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      } catch (err) {
        console.error(`Error writing ${filename}:`, err.message);
        throw new Error(`Failed to save data: ${err.message}`);
      }
    }
  };
};

// File handlers for each entity
const fileHandlers = {
  expenses: createFileHandler('expenses.json'),
  income: createFileHandler('income.json'),
  categories: createFileHandler('categories.json', ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other']),
  incomeCategories: createFileHandler('income_categories.json', ['Salary', 'Freelance', 'Bonus', 'Other'])
};

// Generic validation and data processing
const validators = {
  expenses: (data) => {
    const { amount, category, date } = data;
    if (!amount || !category || !date) {
      throw new Error('Amount, category, and date are required.');
    }
    return data;
  },
  income: (data) => {
    const { amount, source, date } = data;
    if (!amount || !source || !date) {
      throw new Error('Amount, source, and date are required.');
    }
    return data;
  },
  categories: (data) => {
    const { name } = data;
    if (!name) {
      throw new Error('Category name required');
    }
    return data;
  },
  incomeCategories: (data) => {
    const { name } = data;
    if (!name) {
      throw new Error('Category name required');
    }
    return data;
  }
};

// Generic data transformers
const transformers = {
  expenses: (data) => {
    let { amount, category, date, description, tags } = data;
    
    // Ensure date is YYYY-MM-DD
    if (typeof date === 'string' && date.length > 10) {
      date = date.slice(0, 10);
    } else if (date instanceof Date) {
      date = date.toISOString().slice(0, 10);
    }
    
    return {
      id: Date.now().toString(),
      amount,
      category,
      date,
      description: description || '',
      tags: Array.isArray(tags) ? tags : []
    };
  },
  income: (data) => {
    let { amount, source, date, description } = data;
    
    // Ensure date is YYYY-MM-DD
    if (typeof date === 'string' && date.length > 10) {
      date = date.slice(0, 10);
    } else if (date instanceof Date) {
      date = date.toISOString().slice(0, 10);
    }
    
    return {
      id: Date.now().toString(),
      amount,
      source,
      date,
      description: description || ''
    };
  },
  categories: (data) => data.name,
  incomeCategories: (data) => data.name
};

// Generic CRUD operations
const createCRUDHandlers = (entityType) => {
  const handler = fileHandlers[entityType];
  const validator = validators[entityType];
  const transformer = transformers[entityType];
  const isArray = ['expenses', 'income'].includes(entityType);
  
  return {
    // GET all
    getAll: (req, res) => {
      try {
        const data = handler.read();
        res.json(data);
      } catch (err) {
        console.error(`Error in GET ${entityType}:`, err);
        res.status(500).json({ error: `Failed to fetch ${entityType}: ${err.message}` });
      }
    },
    
    // POST new item
    create: (req, res) => {
      try {
        const validatedData = validator(req.body);
        const data = handler.read();
        
        if (isArray) {
          const newItem = transformer(validatedData);
          data.push(newItem);
          handler.write(data);
          res.status(201).json(newItem);
        } else {
          // For categories
          const newItem = transformer(validatedData);
          if (data.includes(newItem)) {
            return res.status(400).json({ error: 'Category already exists' });
          }
          data.push(newItem);
          handler.write(data);
          res.status(201).json({ name: newItem });
        }
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
    
    // PUT update by ID (for expenses and income only)
    update: (req, res) => {
      if (!isArray) {
        return res.status(404).json({ error: 'Update not supported for this endpoint' });
      }
      
      const { id } = req.params;
      const updateData = req.body;
      
      if (!updateData.amount) {
        return res.status(400).json({ error: 'Amount is required.' });
      }
      
      const data = handler.read();
      const itemIndex = data.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return res.status(404).json({ error: `${entityType.slice(0, -1)} not found.` });
      }
      
      // Update the item while preserving existing fields if not provided
      const updatedItem = {
        ...data[itemIndex],
        ...Object.fromEntries(
          Object.entries(updateData).filter(([_, v]) => v !== undefined)
        )
      };
      
      data[itemIndex] = updatedItem;
      handler.write(data);
      res.json(updatedItem);
    },
    
    // DELETE by name/id
    delete: (req, res) => {
      if (isArray) {
        // For expenses/income - delete by ID
        const { id } = req.params;
        const data = handler.read();
        const filteredData = data.filter(item => item.id !== id);
        
        if (filteredData.length === data.length) {
          return res.status(404).json({ error: `${entityType.slice(0, -1)} not found` });
        }
        
        handler.write(filteredData);
        res.json({ success: true });
      } else {
        // For categories - delete by name
        const name = req.params.name;
        const data = handler.read();
        
        if (!data.includes(name)) {
          return res.status(404).json({ error: 'Category not found' });
        }
        
        const filteredData = data.filter(cat => cat !== name);
        handler.write(filteredData);
        res.json({ success: true });
      }
    }
  };
};

// Create CRUD handlers for each entity type
const crudHandlers = {
  expenses: createCRUDHandlers('expenses'),
  income: createCRUDHandlers('income'),
  categories: createCRUDHandlers('categories'),
  incomeCategories: createCRUDHandlers('incomeCategories')
};

// Route definitions using generic handlers
const routes = [
  { path: '/api/expenses', entity: 'expenses', hasUpdate: true },
  { path: '/api/income', entity: 'income', hasUpdate: true },
  { path: '/api/categories', entity: 'categories', hasUpdate: false },
  { path: '/api/income-categories', entity: 'incomeCategories', hasUpdate: false }
];

routes.forEach(({ path, entity, hasUpdate }) => {
  const handlers = crudHandlers[entity];
  
  app.get(path, handlers.getAll);
  app.post(path, handlers.create);
  app.delete(`${path}/:${hasUpdate ? 'id' : 'name'}`, handlers.delete);
  
  if (hasUpdate) {
    app.put(`${path}/:id`, handlers.update);
  }
});

// Catch-all handler: send back index.html for client-side routing (only in production)
if (fs.existsSync(buildPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 