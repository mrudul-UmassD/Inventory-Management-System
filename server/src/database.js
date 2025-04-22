const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Set up the database connection
const dbPath = path.join(dataDir, 'inventory.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
const init = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Create indexes for frequently queried columns
        db.run(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`, (err) => {
          if (err) console.error('Error creating name index:', err);
        });
        
        db.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`, (err) => {
          if (err) console.error('Error creating category index:', err);
        });
        
        db.run(`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)`, (err) => {
          if (err) console.error('Error creating price index:', err);
        });
        
        db.run(`CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity)`, (err) => {
          if (err) console.error('Error creating quantity index:', err);
        });

        console.log('Products table initialized with indexes');
        resolve();
      });
    });
  });
};

// Query helpers
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Export database module
module.exports = {
  init,
  all,
  get,
  run
};