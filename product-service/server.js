const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory data store
let products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 50, ownerId: 1 },
  { id: 2, name: 'Smartphone', price: 699.99, category: 'Electronics', stock: 100, ownerId: 2 },
  { id: 3, name: 'Coffee Maker', price: 89.99, category: 'Home', stock: 30, ownerId: 1 },
  { id: 4, name: 'Desk Chair', price: 249.99, category: 'Furniture', stock: 20, ownerId: 3 }
];

let nextId = 5;

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    service: 'Product Service',
    timestamp: new Date().toISOString()
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  // Optional filtering by category
  const { category } = req.query;
  let filteredProducts = products;
  
  if (category) {
    filteredProducts = products.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  res.status(200).json({
    success: true,
    count: filteredProducts.length,
    data: filteredProducts
  });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with ID ${id} not found`
    });
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});



// Create new product
app.post('/api/products', (req, res) => {
  const { name, price, category, stock, ownerId } = req.body;
  
  // Validation
  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: 'Name and price are required'
    });
  }
  
  if (price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price cannot be negative'
    });
  }
  
  const newProduct = {
    id: nextId++,
    name,
    price: parseFloat(price),
    category: category || 'General',
    stock: stock || 0,
    ownerId: ownerId || 1
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct
  });
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, category, stock, ownerId } = req.body;
  
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Product with ID ${id} not found`
    });
  }
  
  // Validation
  if (price !== undefined && price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price cannot be negative'
    });
  }
  
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock cannot be negative'
    });
  }
  
  // Update product
  products[productIndex] = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    price: price !== undefined ? parseFloat(price) : products[productIndex].price,
    category: category || products[productIndex].category,
    stock: stock !== undefined ? parseInt(stock) : products[productIndex].stock,
    ownerId: ownerId || products[productIndex].ownerId
  };
  
  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: products[productIndex]
  });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Product with ID ${id} not found`
    });
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: deletedProduct
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Product Service is running`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base: http://localhost:${PORT}/api/products`);
  console.log('='.repeat(50));
});
