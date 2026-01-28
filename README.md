# Microservice VCC Assignment

A three-service microservice architecture with API Gateway pattern built with Node.js for VCC assignment demonstrating VM networking and service deployment.

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
              │    API Gateway VM      │
              │    Port: 3000          │
              └────────┬───────────────┘
                       │
          ┌────────────┼────────────┐
          │                         │
          ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ VM 1            │       │ VM 2            │
│ User Service◄───┼───────┤ Product Service │
│ Port: 3001      │       │ Port: 3002      │
└─────────────────┘       └─────────────────┘
```

## 📋 Prerequisites

- VirtualBox installed on host machine
- Ubuntu Server (recommended) or any Linux distribution on VMs
- Node.js 18+ installed on all VMs
- Basic understanding of REST APIs and networking

## 🚀 Quick Start (Local Testing)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd microservice-vcc
```

### 2. Start User Service (in terminal 1)

```bash
cd user-service
npm install
npm start
```

User Service will run on `http://localhost:3001`

### 3. Start Product Service (in terminal 2)

```bash
cd product-service
npm install
npm start
```

Product Service will run on `http://localhost:3002`

### 4. Start API Gateway (in terminal 3)

```bash
cd api-gateway
npm install
npm start
```

API Gateway will run on `http://localhost:3000`

### 5. Test the API Gateway (single interface for all requests)

```bash
# Check gateway health
curl http://localhost:3000/health

# Get welcome message
curl http://localhost:3000/

# Get all users (via gateway)
curl http://localhost:3000/api/users

# Get all products (via gateway)
curl http://localhost:3000/api/products

# SPECIAL: Dashboard - aggregates data from both services
curl http://localhost:3000/api/dashboard

# SPECIAL: Get user with their products
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

## 🖥️ VM Deployment Guide

### Step 1: Create VMs in VirtualBox

1. Create two Ubuntu Server VMs:
   - **VM1**: user-service-vm (1GB RAM, 10GB storage)
   - **VM2**: product-service-vm (1GB RAM, 10GB storage)

2. Configure Network:
   - **Option A (Recommended)**: Use NAT Network
     - VirtualBox → Tools → Network Manager → NAT Networks → Create
     - Name: microservice-network, Network: 10.0.2.0/24
     - Attach both VMs to this network
   
   - **Option B**: Use Host-Only Network
     - Create host-only adapter in VirtualBox settings
     - Assign static IPs to both VMs

### Step 2: Install Node.js on Both VMs

```bash
# SSH into each VM and run:
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v18.x.x
```

### Step 3: Transfer Code to VMs

**Option A: Use Git (Recommended)**
```bash
# On each VM
git clone <your-github-repo-url>
cd microservice-vcc
```

**Option B: Use SCP from host**
```bash
# From host machine
scp -r user-service username@<VM1-IP>:~/
scp -r product-service username@<VM2-IP>:~/
```

### Step 4: Deploy User Service on VM1

```bash
# SSH into VM1
cd user-service
npm install
npm start
```

To run as background service:
```bash
# Install PM2 process manager
sudo npm install -g pm2

# Start service
pm2 start server.js --name user-service

# Make it auto-start on reboot
pm2 startup
pm2 save
```

### Step 5: Deploy Product Service on VM2

First, get VM1's IP address:
```bash
# On VM1
ip addr show
# Note the IP address (e.g., 10.0.2.4)
```

Then deploy Product Service:
```bash
# SSH into VM2
cd product-service

# Set the User Service URL
export USER_SERVICE_URL=http://<VM1-IP>:3001

# Install and start
npm install
npm start

# Or with PM2
pm2 start server.js --name product-service -- USER_SERVICE_URL=http://<VM1-IP>:3001
pm2 startup
pm2 save
```

### Step 6: Test from Host Machine

Get the IP addresses of both VMs and test:

```bash
# Test User Service (VM1)
curl http://<VM1-IP>:3001/health
curl http://<VM1-IP>:3001/api/users

# Test Product Service (VM2)
curl http://<VM2-IP>:3002/health
curl http://<VM2-IP>:3002/api/products

# Test inter-service communication
curl http://<VM2-IP>:3002/api/products/1/with-owner
```

## 🔧 Troubleshooting

### Can't connect to services from host

1. Check firewall on VMs:
```bash
sudo ufw allow 3001
sudo ufw allow 3002
```

2. Ensure services are listening on 0.0.0.0:
```bash
netstat -tulpn | grep node
```

### Inter-service communication fails

1. Verify VM1 IP in Product Service:
```bash
# On VM2
echo $USER_SERVICE_URL
```

2. Test connectivity:
```bash
# From VM2
curl http://<VM1-IP>:3001/health
```

### Service crashes on VM

Check logs:
```bash
pm2 logs product-service
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

1. ✅ VirtualBox VM creation and configuration
2. ✅ Network setup between VMs
3. ✅ Node.js installation on VMs
4. ✅ Service deployment on separate VMs
5. ✅ Testing health checks
6. ✅ CRUD operations on both services
7. ✅ Inter-service communication (product with owner)
8. ✅ Show service logs and PM2 status

## 📄 License

MIT

## 👨‍💻 Author

Created for VCC Assignment - Microservice Deployment
