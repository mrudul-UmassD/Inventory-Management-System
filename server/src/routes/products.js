const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const logger = require('../logger');
const db = require('../database');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Create unique filename using timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});



// Export products to CSV
router.get('/export', async (req, res) => {
  try {
    // Fetch all products
    const products = await db.all('SELECT * FROM products');
    console.log("!!!!!");
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products-export-${Date.now()}.csv"`);
    
    // Write CSV header
    res.write('id,name,description,category,price,quantity,created_at,updated_at\n');
    
    // Write product rows
    products.forEach(product => {
      // Clean and escape fields (simple approach)
      const row = [
        product.id,
        `"${escapeCsvValue(product.name)}"`,
        `"${escapeCsvValue(product.description || '')}"`,
        `"${escapeCsvValue(product.category || '')}"`,
        product.price,
        product.quantity,
        product.created_at,
        product.updated_at
      ].join(',');
      
      res.write(row + '\n');
    });
    
    res.end();
    logger.info(`Products exported to CSV (${products.length} records)`);
  } catch (err) {
    logger.error('Error exporting products to CSV:', err);
    res.status(500).json({ error: 'Server error during export', details: err.message });
  }
});

// Get all products with pagination, sorting, and filters
router.get('/', async (req, res) => {
  try {
    const { 
      name, category, minQuantity, maxQuantity, 
      minPrice, maxPrice, page = 1, limit = 10, 
      sortBy = 'name', sortOrder = 'asc',
      fromDate, toDate
    } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Start building query
    let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    const countParams = [];
    
    // Apply filters
    if (name) {
      sql += ' AND name LIKE ?';
      countSql += ' AND name LIKE ?';
      params.push(`%${name}%`);
      countParams.push(`%${name}%`);
    }
    
    if (category) {
      sql += ' AND category = ?';
      countSql += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }
    
    if (minQuantity) {
      sql += ' AND quantity >= ?';
      countSql += ' AND quantity >= ?';
      params.push(minQuantity);
      countParams.push(minQuantity);
    }
    
    if (maxQuantity) {
      sql += ' AND quantity <= ?';
      countSql += ' AND quantity <= ?';
      params.push(maxQuantity);
      countParams.push(maxQuantity);
    }
    
    if (minPrice) {
      sql += ' AND price >= ?';
      countSql += ' AND price >= ?';
      params.push(minPrice);
      countParams.push(minPrice);
    }
    
    if (maxPrice) {
      sql += ' AND price <= ?';
      countSql += ' AND price <= ?';
      params.push(maxPrice);
      countParams.push(maxPrice);
    }
    
    if (fromDate) {
      sql += ' AND created_at >= ?';
      countSql += ' AND created_at >= ?';
      params.push(fromDate);
      countParams.push(fromDate);
    }
    
    if (toDate) {
      sql += ' AND created_at <= ?';
      countSql += ' AND created_at <= ?';
      params.push(toDate);
      countParams.push(toDate);
    }
    
    // Apply sorting
    sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
    
    // Apply pagination
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    // Get total count for pagination
    const countResult = await db.get(countSql, countParams);
    const total = countResult.total;
    
    // Get paginated products
    const products = await db.all(sql, params);
    
    res.json({
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
    
    logger.info(`Products fetched with pagination. Page: ${page}, Limit: ${limit}`);
  } catch (err) {
    logger.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (!product) {
      logger.warn(`Product not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    logger.info(`Product fetched by ID: ${req.params.id}`);
    res.json(product);
  } catch (err) {
    logger.error(`Error fetching product with ID ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Create a new product with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    
    // Validate required fields
    if (!name || price === undefined || quantity === undefined) {
      if (req.file) {
        // Remove uploaded file if validation fails
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }
    
    // Get image URL if file is uploaded
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await db.run(
      'INSERT INTO products (name, description, category, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, category, price, quantity, imageUrl]
    );
    
    const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [result.id]);
    logger.info(`New product created with ID: ${result.id}`);
    res.status(201).json(newProduct);
  } catch (err) {
    // Clean up uploaded file in case of error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    logger.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update a product with image upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    const productId = req.params.id;
    
    // Check if product exists
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      if (req.file) {
        // Remove uploaded file if product doesn't exist
        fs.unlinkSync(req.file.path);
      }
      logger.warn(`Attempt to update non-existent product with ID: ${productId}`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let imageUrl = product.image_url;
    
    // Handle new image upload
    if (req.file) {
      // Delete old image if it exists and is not the default
      if (product.image_url && !product.image_url.includes('default')) {
        const oldImagePath = path.join(__dirname, '../../', product.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new image URL
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // Update the product
    await db.run(
      `UPDATE products SET 
        name = ?, 
        description = ?, 
        category = ?, 
        price = ?, 
        quantity = ?,
        image_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name || product.name,
        description !== undefined ? description : product.description,
        category || product.category,
        price !== undefined ? price : product.price,
        quantity !== undefined ? quantity : product.quantity,
        imageUrl,
        productId
      ]
    );
    
    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    logger.info(`Product updated with ID: ${productId}`);
    res.json(updatedProduct);
  } catch (err) {
    // Clean up uploaded file in case of error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    logger.error(`Error updating product with ID ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      logger.warn(`Attempt to delete non-existent product with ID: ${productId}`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete associated image if it exists
    if (product.image_url) {
      const imagePath = path.join(__dirname, '../../', product.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        logger.info(`Deleted image for product ID: ${productId}`);
      }
    }
    
    // Delete the product
    await db.run('DELETE FROM products WHERE id = ?', [productId]);
    
    logger.info(`Product deleted with ID: ${productId}`);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting product with ID ${req.params.id}:`, err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all unique categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL');
    logger.info('Categories list fetched');
    res.json(categories.map(c => c.category));
  } catch (err) {
    logger.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Bulk import products from CSV
router.post('/bulk-import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required' });
  }

  if (path.extname(req.file.originalname).toLowerCase() !== '.csv') {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Only CSV files are allowed' });
  }

  const products = [];
  const errors = [];
  let rowCount = 0;
  let successCount = 0;

  try {
    // Process CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', async (data) => {
          rowCount++;
          
          // Validate row data
          if (!data.name || isNaN(data.price) || isNaN(data.quantity)) {
            errors.push({
              row: rowCount,
              error: 'Missing required fields or invalid data types'
            });
            return;
          }
          
          // Add to products array for bulk insertion
          products.push({
            name: data.name,
            description: data.description || null,
            category: data.category || null,
            price: parseFloat(data.price),
            quantity: parseInt(data.quantity)
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Insert valid products
    for (const product of products) {
      try {
        await db.run(
          'INSERT INTO products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)',
          [product.name, product.description, product.category, product.price, product.quantity]
        );
        successCount++;
      } catch (err) {
        logger.error(`Error inserting product ${product.name} during bulk import:`, err);
        errors.push({
          product: product.name,
          error: err.message
        });
      }
    }

    // Clean up uploaded CSV file
    fs.unlinkSync(req.file.path);

    logger.info(`Bulk import completed: ${successCount} products added, ${errors.length} errors`);
    res.json({
      success: true,
      message: `Imported ${successCount} products successfully`,
      totalRows: rowCount,
      successfulImports: successCount,
      errors: errors.length > 0 ? errors : null
    });
  } catch (err) {
    // Clean up uploaded file in case of error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    logger.error('Error processing bulk import:', err);
    res.status(500).json({ error: 'Server error during bulk import', details: err.message });
  }
});

// Helper function to escape CSV values
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/"/g, '""');
}

module.exports = router;