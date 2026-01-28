# Microservice VCC Assignment

A three-service microservice architecture with API Gateway pattern built with Node.js for VCC assignment.

## 🏗️ Architecture

This project consists of three independent microservices following the API Gateway pattern:

- **API Gateway** (Port 3000) - Single entry point for all client requests
- **User Service** (Port 3001) - Manages user data
- **Product Service** (Port 3002) - Manages products and demonstrates inter-service communication

```
                    ┌──────────────┐
                    │    Client    │
                    └──────┬───────┘
                           │ All requests go through gateway
                           ▼
              ┌────────────────────────┐
              │    API Gateway         │
              │    Port: 3000          │
              └────────┬───────────────┘
                       │
          ┌────────────┼────────────┐
          │                         │
          ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ User Service◄───┼───────┤ Product Service │
│ Port: 3001      │       │ Port: 3002      │
└─────────────────┘       └─────────────────┘
```

## 📋 Prerequisites

- Ubuntu Server (recommended) or any Linux distribution
- Node.js 18+ installed
- Basic understanding of REST APIs and networking

## 🚀 How to Start Services

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd microservice-vcc
```

### 2. Start User Service

```bash
cd user-service
npm install
npm start
```

User Service will run on port `3001`

### 3. Start Product Service

```bash
cd product-service
npm install

# Set User Service URL (if running on different servers)
export USER_SERVICE_URL=http://<user-service-ip>:3001

npm start
```

Product Service will run on port `3002`

### 4. Start API Gateway

```bash
cd api-gateway
npm install

# Set backend service URLs (if running on different servers)
export USER_SERVICE_URL=http://<user-service-ip>:3001
export PRODUCT_SERVICE_URL=http://<product-service-ip>:3002

npm start
```

API Gateway will run on port `3000`

### 5. Test the Services

```bash
# Check gateway health
curl http://localhost:3000/health

# Get all users (via gateway)
curl http://localhost:3000/api/users

# Get all products (via gateway)
curl http://localhost:3000/api/products

# Dashboard - aggregates data from both services
curl http://localhost:3000/api/dashboard

# Get user with their products
curl http://localhost:3000/api/users/1/products
```

## 📚 API Documentation

### API Gateway (Port 3000) - **USE THIS AS YOUR MAIN INTERFACE**

The API Gateway is the single entry point for all client requests. Clients should only interact with the gateway, not directly with backend services.

#### Gateway-Specific Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message with available endpoints |
| GET | `/health` | Gateway health check |
| GET | `/api/services/health` | Check health of all backend services |
| GET | `/api/dashboard` | **Aggregated data from User and Product services** |
| GET | `/api/users/:id/products` | **Get user with all their products (aggregation)** |

**Example: Dashboard (Data Aggregation)**
```bash
curl http://localhost:3000/api/dashboard
```
Response includes total users, total products, and combined data from both services.

**Example: User with Products (Cross-service Aggregation)**
```bash
curl http://localhost:3000/api/users/1/products
```
Returns user details along with all products owned by that user.

#### Proxied User Endpoints (via Gateway)

All User Service endpoints are available through the gateway:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

#### Proxied Product Endpoints (via Gateway)

All Product Service endpoints are available through the gateway:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products?category=value` | Filter by category |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/:id/with-owner` | Get product with owner info |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

---

### User Service (Port 3001) - Backend Service

> [!NOTE]
> Clients should use the API Gateway instead of calling this service directly.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

**Example: Create User**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","role":"User"}'
```

### Product Service (Port 3002) - Backend Service

> [!NOTE]
> Clients should use the API Gateway instead of calling this service directly.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/products` | Get all products |
| GET | `/api/products?category=Electronics` | Filter by category |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/:id/with-owner` | Get product with owner info |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

**Example: Create Product**
```bash
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Tablet","price":399.99,"category":"Electronics","stock":25,"ownerId":1}'
```

**Example: Inter-Service Communication**
```bash
# This endpoint makes Product Service call User Service
curl http://localhost:3002/api/products/1/with-owner
```


## � How API Gateway Gets Service IP Addresses

The API Gateway needs to know where the User Service and Product Service are running to route requests correctly. This is configured using environment variables:

### Environment Variables Configuration

#### API Gateway Service Discovery

The API Gateway uses the following environment variables to discover backend services:

```bash
USER_SERVICE_URL=http://<user-service-ip>:3001
PRODUCT_SERVICE_URL=http://<product-service-ip>:3002
```

**Default Behavior (Local Development):**
- If environment variables are not set, the API Gateway defaults to `localhost`:
  - User Service: `http://localhost:3001`
  - Product Service: `http://localhost:3002`

**Distributed Deployment:**
- When services run on different servers, you must set environment variables with actual IP addresses:

```bash
# Example: Services running on different servers
export USER_SERVICE_URL=http://192.168.1.10:3001
export PRODUCT_SERVICE_URL=http://192.168.1.11:3002

cd api-gateway
npm start
```

#### Product Service to User Service Communication

The Product Service also needs to communicate with the User Service for features like getting product owner information:

```bash
USER_SERVICE_URL=http://<user-service-ip>:3001
```

**Example:**

```bash
# On the server running Product Service
export USER_SERVICE_URL=http://192.168.1.10:3001

cd product-service
npm start
```

### Service Discovery Methods

1. **Environment Variables (Current Implementation)**
   - Simple and straightforward
   - Set at service startup time
   - Good for small-scale deployments

2. **Future Enhancements (Not Implemented)**
   - Service Registry (e.g., Consul, Eureka)
   - DNS-based discovery
   - Kubernetes Service Discovery

### Configuration File Example

You can also create a `.env` file in each service directory:

**api-gateway/.env:**
```env
USER_SERVICE_URL=http://192.168.1.10:3001
PRODUCT_SERVICE_URL=http://192.168.1.11:3002
PORT=3000
```

**product-service/.env:**
```env
USER_SERVICE_URL=http://192.168.1.10:3001
PORT=3002
```

Then install `dotenv` package:
```bash
npm install dotenv
```

And load it in your service (already implemented in the code):
```javascript
require('dotenv').config();
```

## 🔍 Running Services as Background Processes

To keep services running in the background, use PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start User Service
cd user-service
pm2 start server.js --name user-service

# Start Product Service with environment variable
cd product-service
pm2 start server.js --name product-service --env USER_SERVICE_URL=http://<user-service-ip>:3001

# Start API Gateway with environment variables
cd api-gateway
pm2 start server.js --name api-gateway --env USER_SERVICE_URL=http://<user-service-ip>:3001 --env PRODUCT_SERVICE_URL=http://<product-service-ip>:3002

# View all running services
pm2 list

# View logs
pm2 logs

# Make services auto-start on reboot
pm2 startup
pm2 save
```



## 🔧 Troubleshooting

### Can't connect to services

1. Check if service is running:
```bash
pm2 list
# or
ps aux | grep node
```

2. Check firewall rules (if running on server):
```bash
sudo ufw allow 3001
sudo ufw allow 3002
sudo ufw allow 3000
```

3. Ensure services are listening on correct interface:
```bash
netstat -tulpn | grep node
# or
ss -tulpn | grep node
```

### Inter-service communication fails

1. Verify environment variables are set correctly:
```bash
echo $USER_SERVICE_URL
echo $PRODUCT_SERVICE_URL
```

2. Test connectivity between services:
```bash
# From Product Service server, test User Service
curl http://<user-service-ip>:3001/health

# From API Gateway server, test both services
curl http://<user-service-ip>:3001/health
curl http://<product-service-ip>:3002/health
```

3. Check service logs for errors:
```bash
pm2 logs product-service
pm2 logs api-gateway
```

### Service crashes or exits

Check logs and restart:
```bash
# View logs
pm2 logs <service-name>

# Restart service
pm2 restart <service-name>

# Delete and restart
pm2 delete <service-name>
pm2 start server.js --name <service-name>
```

### Port already in use

```bash
# Find process using the port
lsof -i :3001

# Kill the process
kill -9 <PID>
```


## 📊 Microservice Principles Demonstrated

✅ **Service Independence** - Each service runs independently  
✅ **Single Responsibility** - Each service has one clear purpose  
✅ **API-First Design** - Services communicate via REST APIs  
✅ **Decentralized Data** - Each service manages its own data  
✅ **Horizontal Scalability** - Services can scale independently  
✅ **Fault Tolerance** - Product Service handles User Service failures gracefully

## 📁 Project Structure

```
microservice-vcc/
├── user-service/
│   ├── server.js           # User Service main file
│   ├── package.json        # Dependencies
│   ├── Dockerfile          # Optional Docker configuration
│   └── .dockerignore
├── product-service/
│   ├── server.js           # Product Service main file
│   ├── package.json        # Dependencies
│   ├── Dockerfile          # Optional Docker configuration
│   └── .dockerignore
├── docs/
│   ├── ARCHITECTURE.md     # Detailed architecture
│   └── DEPLOYMENT_GUIDE.md # Step-by-step deployment
└── README.md               # This file
```


## 🎥 Video Demo Checklist

For your assignment video, demonstrate:

1. ✅ Service architecture overview
2. ✅ Starting all three services (User, Product, API Gateway)
3. ✅ Environment variable configuration for service discovery
4. ✅ Testing health checks on all services
5. ✅ CRUD operations via API Gateway
6. ✅ Dashboard endpoint (data aggregation)
7. ✅ User with products endpoint (cross-service communication)
8. ✅ Service logs using PM2


## 📄 License

MIT

## 👨‍💻 Author

Created for VCC Assignment - Microservice Deployment
