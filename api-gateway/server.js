const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs - can be configured via environment variables
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    services: {
      userService: USER_SERVICE_URL,
      productService: PRODUCT_SERVICE_URL
    }
  });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Microservice API Gateway',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      dashboard: '/api/dashboard'
    },
    documentation: 'See README.md for API documentation'
  });
});

// =====================================================
// USER SERVICE ROUTES (Proxy to User Service)
// =====================================================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling User Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with User Service',
      error: error.message
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling User Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with User Service',
      error: error.response?.data?.message || error.message
    });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/users`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error calling User Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with User Service',
      error: error.response?.data?.message || error.message
    });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.put(`${USER_SERVICE_URL}/api/users/${req.params.id}`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling User Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with User Service',
      error: error.response?.data?.message || error.message
    });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${USER_SERVICE_URL}/api/users/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling User Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with User Service',
      error: error.response?.data?.message || error.message
    });
  }
});

// =====================================================
// PRODUCT SERVICE ROUTES (Proxy to Product Service)
// =====================================================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products`, {
      params: req.query
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling Product Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with Product Service',
      error: error.message
    });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling Product Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with Product Service',
      error: error.response?.data?.message || error.message
    });
  }
});

// Get product with owner (aggregation at gateway level)
app.get('/api/products/:id/with-owner', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Get product details from Product Service
    const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    const product = productResponse.data.data;
    
    // Get owner details from User Service
    const userResponse = await axios.get(`${USER_SERVICE_URL}/api/users/${product.ownerId}`);
    const owner = userResponse.data.data;
    
    res.status(200).json({
      success: true,
      message: 'Product with owner information aggregated at gateway',
      data: {
        ...product,
        owner: owner
      }
    });
  } catch (error) {
    console.error('Error aggregating product with owner:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error aggregating product with owner information',
      error: error.response?.data?.message || error.message
    });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const response = await axios.post(`${PRODUCT_SERVICE_URL}/api/products`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error calling Product Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with Product Service',
      error: error.response?.data?.message || error.message
    });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.put(`${PRODUCT_SERVICE_URL}/api/products/${req.params.id}`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling Product Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with Product Service',
      error: error.response?.data?.message || error.message
    });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${PRODUCT_SERVICE_URL}/api/products/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling Product Service:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error communicating with Product Service',
      error: error.response?.data?.message || error.message
    });
  }
});

// =====================================================
// AGGREGATION ENDPOINTS (Gateway-specific features)
// =====================================================

// Dashboard endpoint - aggregates data from both services
app.get('/api/dashboard', async (req, res) => {
  try {
    const [usersResponse, productsResponse] = await Promise.all([
      axios.get(`${USER_SERVICE_URL}/api/users`),
      axios.get(`${PRODUCT_SERVICE_URL}/api/products`)
    ]);

    res.status(200).json({
      success: true,
      message: 'Dashboard data aggregated from User and Product services',
      data: {
        users: {
          total: usersResponse.data.count,
          data: usersResponse.data.data
        },
        products: {
          total: productsResponse.data.count,
          data: productsResponse.data.data
        },
        summary: {
          totalUsers: usersResponse.data.count,
          totalProducts: productsResponse.data.count,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error aggregating dashboard data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error aggregating data from services',
      error: error.message
    });
  }
});

// Get user with their products
app.get('/api/users/:id/products', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Get user details
    const userResponse = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`);
    const user = userResponse.data.data;
    
    // Get all products owned by this user
    const productsResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products`);
    const userProducts = productsResponse.data.data.filter(p => p.ownerId === userId);
    
    res.status(200).json({
      success: true,
      message: 'User data aggregated with their products',
      data: {
        user: user,
        products: userProducts,
        productCount: userProducts.length
      }
    });
  } catch (error) {
    console.error('Error aggregating user products:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error aggregating user products',
      error: error.response?.data?.message || error.message
    });
  }
});

// Service health check - checks all backend services
app.get('/api/services/health', async (req, res) => {
  const services = {};
  
  // Check User Service
  try {
    const userHealthResponse = await axios.get(`${USER_SERVICE_URL}/health`, { timeout: 3000 });
    services.userService = { status: 'UP', ...userHealthResponse.data };
  } catch (error) {
    services.userService = { status: 'DOWN', error: error.message };
  }
  
  // Check Product Service
  try {
    const productHealthResponse = await axios.get(`${PRODUCT_SERVICE_URL}/health`, { timeout: 3000 });
    services.productService = { status: 'UP', ...productHealthResponse.data };
  } catch (error) {
    services.productService = { status: 'DOWN', error: error.message };
  }
  
  const allHealthy = services.userService.status === 'UP' && services.productService.status === 'UP';
  
  res.status(allHealthy ? 200 : 503).json({
    gateway: 'UP',
    services: services,
    overallStatus: allHealthy ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/services/health',
      'GET /api/dashboard',
      'GET /api/users',
      'GET /api/users/:id',
      'GET /api/users/:id/products',
      'POST /api/users',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'GET /api/products',
      'GET /api/products/:id',
      'GET /api/products/:id/with-owner',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id'
    ]
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
  console.log('='.repeat(60));
  console.log(`🚪 API Gateway is running`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`🔗 User Service: ${USER_SERVICE_URL}`);
  console.log(`🔗 Product Service: ${PRODUCT_SERVICE_URL}`);
  console.log('='.repeat(60));
});
