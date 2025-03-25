const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { name, category, minQuantity, maxQuantity } = req.query;
    
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (name) {
      sql += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (minQuantity) {
      sql += ' AND quantity >= ?';
      params.push(minQuantity);
    }
    
    if (maxQuantity) {
      sql += ' AND quantity <= ?';
      params.push(maxQuantity);
    }
    
    sql += ' ORDER BY name ASC';
    
    const products = await db.all(sql, params);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    
    // Validate required fields
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }
    
    const result = await db.run(
      'INSERT INTO products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)',
      [name, description, category, price, quantity]
    );
    
    const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [result.id]);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    const productId = req.params.id;
    
    // Check if product exists
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update the product
    await db.run(
      `UPDATE products SET 
        name = ?, 
        description = ?, 
        category = ?, 
        price = ?, 
        quantity = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name || product.name,
        description !== undefined ? description : product.description,
        category || product.category,
        price !== undefined ? price : product.price,
        quantity !== undefined ? quantity : product.quantity,
        productId
      ]
    );
    
    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete the product
    await db.run('DELETE FROM products WHERE id = ?', [productId]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all unique categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL');
    res.json(categories.map(c => c.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 