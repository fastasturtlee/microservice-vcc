# Microservice Architecture

## Overview

This project implements a microservice architecture pattern using Node.js and Express, designed to be deployed across multiple Virtual Machines in VirtualBox.

## Architecture Diagram

```
                           ┌────────────────────┐
                           │   Client/Host      │
                           │    Machine         │
                           └─────────┬──────────┘
                                     │
                    ┌────────────────┴─────────────────┐
                    │                                  │
          ┌─────────▼────────┐              ┌─────────▼────────┐
          │  Virtual Machine 1│              │  Virtual Machine 2│
          │  ─────────────────│              │  ─────────────────│
          │                   │              │                   │
          │  User Service     │◄────────────►│  Product Service  │
          │  Port: 3001       │     HTTP     │  Port: 3002       │
          │                   │              │                   │
          │  ┌──────────────┐ │              │  ┌──────────────┐ │
          │  │ REST API     │ │              │  │ REST API     │ │
          │  ├──────────────┤ │              │  ├──────────────┤ │
          │  │ In-Memory DB │ │              │  │ In-Memory DB │ │
          │  └──────────────┘ │              │  └──────────────┘ │
          │                   │              │                   │
          └───────────────────┘              └───────────────────┘
                  │                                    │
                  │          NAT Network or            │
                  └──────── Host-Only Network ─────────┘
```

## Service Breakdown

### User Service (Microservice 1)

**Purpose**: Manages user data and authentication

**Responsibilities**:
- User CRUD operations
- User data validation
- User information storage

**API Endpoints**:
- `GET /health` - Health check
- `GET /api/users` - Retrieve all users
- `GET /api/users/:id` - Retrieve specific user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Data Model**:
```javascript
{
  id: Number,
  name: String,
  email: String,
  role: String
}
```

---

### Product Service (Microservice 2)

**Purpose**: Manages product catalog and inventory

**Responsibilities**:
- Product CRUD operations
- Inventory management
- Product categorization
- Owner information retrieval (via User Service)

**API Endpoints**:
- `GET /health` - Health check
- `GET /api/products` - Retrieve all products
- `GET /api/products?category=value` - Filter by category
- `GET /api/products/:id` - Retrieve specific product
- `GET /api/products/:id/with-owner` - Retrieve product with owner details
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**Data Model**:
```javascript
{
  id: Number,
  name: String,
  price: Number,
  category: String,
  stock: Number,
  ownerId: Number  // References User Service
}
```

---

## Inter-Service Communication

The Product Service demonstrates microservice communication by calling the User Service to retrieve owner information:

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│                 │       │                  │       │                 │
│   Client        │──────►│ Product Service  │──────►│  User Service   │
│                 │  (1)  │                  │  (2)  │                 │
└─────────────────┘       └──────────────────┘       └─────────────────┘
                                    │                         │
                                    │◄────────────────────────┘
                                    │         (3)
                                    ▼
                          ┌──────────────────┐
                          │   Combined Data  │
                          │   (Product +     │
                          │    Owner Info)   │
                          └──────────────────┘
```

**Flow**:
1. Client requests product with owner: `GET /api/products/1/with-owner`
2. Product Service retrieves product from its database
3. Product Service makes HTTP call to User Service: `GET /api/users/:ownerId`
4. Product Service combines data and returns to client

**Fault Tolerance**: If User Service is unavailable, Product Service returns product data without owner information and includes a warning message.

## Key Microservice Principles

### 1. Single Responsibility Principle
- Each service has one clear purpose
- User Service: User management only
- Product Service: Product management only

### 2. Decentralized Data Management
- Each service maintains its own data store
- No shared database between services
- Services own their data

### 3. Independent Deployment
- Services can be deployed independently
- Different release cycles possible
- No deployment dependencies

### 4. API-Based Communication
- Services communicate via HTTP REST APIs
- Loose coupling between services
- Language-agnostic interfaces

### 5. Resilience and Fault Tolerance
- Services handle failures gracefully
- Product Service works even if User Service is down
- Proper error handling and logging

### 6. Scalability
- Services can scale independently
- User Service can have different scaling requirements than Product Service
- Horizontal scaling possible

## Network Architecture

### NAT Network Configuration (Recommended)

```
Host Machine (192.168.1.x)
    │
    │ NAT Network: 10.0.2.0/24
    │
    ├─── VM1 (10.0.2.4) - User Service
    │
    └─── VM2 (10.0.2.5) - Product Service
```

**Advantages**:
- VMs can communicate with each other
- VMs can access internet
- Host can access VMs
- Easy to configure

### Host-Only Network Configuration (Alternative)

```
Host Machine
    │
    │ vboxnet0: 192.168.56.1
    │
    ├─── VM1 (192.168.56.10) - User Service
    │
    └─── VM2 (192.168.56.11) - Product Service
```

**Advantages**:
- Isolated network
- Predictable IP addresses
- No internet dependency

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **HTTP Client**: Axios (for inter-service calls)
- **Middleware**: CORS, Body-Parser
- **Data Storage**: In-Memory (for demonstration)
- **Process Manager**: PM2 (for production deployment)

## Design Decisions

### Why In-Memory Storage?
- Simple deployment without database setup
- Focus on microservice architecture, not database management
- Easy to demo and test
- Sufficient for assignment requirements

### Why Two Separate Services?
- Demonstrates service independence
- Shows inter-service communication
- Meets assignment requirement of multiple services
- Real-world scenario (user and product management)

### Why REST APIs?
- Industry standard for microservices
- Easy to test with curl
- Language-agnostic
- Well-understood HTTP methods

### Why PM2?
- Process management for Node.js
- Auto-restart on crashes
- Log management
- Easy monitoring
- Production-grade deployment

## Scalability Considerations

### Horizontal Scaling
Each service can be scaled independently by adding more instances:

```
User Service:
  VM1-instance1 (10.0.2.4)
  VM1-instance2 (10.0.2.6)
  VM1-instance3 (10.0.2.7)

Product Service:
  VM2-instance1 (10.0.2.5)
  VM2-instance2 (10.0.2.8)
```

A load balancer (nginx, HAProxy) could distribute traffic across instances.

### Vertical Scaling
Each VM can be allocated more resources:
- Increase RAM
- Add more CPU cores
- Increase storage

## Security Considerations

- Services run as non-root users
- CORS enabled for cross-origin requests
- Input validation on all endpoints
- Error messages don't expose sensitive info
- Health checks for monitoring

## Future Enhancements

1. **Database Integration**: Replace in-memory storage with PostgreSQL or MongoDB
2. **Authentication**: Add JWT-based authentication
3. **Service Discovery**: Implement Consul or Eureka
4. **API Gateway**: Add Kong or Express Gateway
5. **Message Queue**: Add RabbitMQ or Kafka for async communication
6. **Monitoring**: Add Prometheus and Grafana
7. **Logging**: Centralized logging with ELK stack
8. **Container Orchestration**: Kubernetes deployment

## References

- [Microservices.io - Microservice Architecture](https://microservices.io/)
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
- [Express.js Documentation](https://expressjs.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
