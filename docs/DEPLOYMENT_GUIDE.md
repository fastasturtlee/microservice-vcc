# VirtualBox VM Deployment Guide

Complete step-by-step guide to deploy the microservice application across multiple VirtualBox VMs.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VirtualBox Setup](#virtualbox-setup)
3. [VM Creation](#vm-creation)
4. [Network Configuration](#network-configuration)
5. [Operating System Installation](#operating-system-installation)
6. [Node.js Installation](#nodejs-installation)
7. [Service Deployment](#service-deployment)
8. [Testing and Verification](#testing-and-verification)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- VirtualBox 6.1+ ([Download](https://www.virtualbox.org/wiki/Downloads))
- Ubuntu Server 22.04 LTS ISO ([Download](https://ubuntu.com/download/server))
- Git (for source code management)

### System Requirements
- Host machine with 4GB+ RAM
- 30GB+ free disk space
- Internet connection

---

## VirtualBox Setup

### 1. Install VirtualBox

**Windows/Mac**:
- Download installer from VirtualBox website
- Run installer with default settings
- Restart if prompted

**Linux**:
```bash
sudo apt update
sudo apt install virtualbox virtualbox-ext-pack
```

### 2. Verify Installation

Launch VirtualBox and verify it opens successfully.

---

## VM Creation

We'll create two identical VMs with different names.

### Create VM1 (User Service VM)

1. **Open VirtualBox** → Click "New"

2. **Configure VM**:
   - Name: `user-service-vm`
   - Machine Folder: Default
   - Type: Linux
   - Version: Ubuntu (64-bit)
   - Click "Next"

3. **Memory Size**:
   - RAM: 1024 MB (1GB)
   - Click "Next"

4. **Hard Disk**:
   - Select "Create a virtual hard disk now"
   - Click "Create"

5. **Hard Disk File Type**:
   - Select "VDI (VirtualBox Disk Image)"
   - Click "Next"

6. **Storage**:
   - Select "Dynamically allocated"
   - Click "Next"

7. **File Size**:
   - Size: 10 GB
   - Click "Create"

### Create VM2 (Product Service VM)

Repeat the above steps with:
- Name: `product-service-vm`
- Same specifications (1GB RAM, 10GB disk)

---

## Network Configuration

### Option A: NAT Network (Recommended)

NAT Network allows VMs to communicate with each other and access the internet.

#### 1. Create NAT Network

1. **VirtualBox** → **Tools** → **Network Manager**
2. Click **NAT Networks** tab
3. Click **Create** button
4. Configure:
   - Name: `microservice-network`
   - IPv4 Prefix: `10.0.2.0/24`
   - Enable DHCP: ✅ Checked
   - Supports IPv6: ⬜ Unchecked
5. Click **Apply**

#### 2. Attach VMs to NAT Network

For **both VMs** (user-service-vm and product-service-vm):

1. Select VM → **Settings** → **Network**
2. Adapter 1:
   - Enable Network Adapter: ✅ Checked
   - Attached to: **NAT Network**
   - Name: **microservice-network**
3. Click **OK**

### Option B: Host-Only Network

Provides isolated network between host and VMs.

#### 1. Create Host-Only Network

1. **File** → **Host Network Manager**
2. Click **Create**
3. Configure:
   - IPv4 Address: `192.168.56.1`
   - IPv4 Network Mask: `255.255.255.0`
   - DHCP Server: ✅ Enabled
4. Click **Apply**

#### 2. Attach VMs

For both VMs:
1. Settings → Network → Adapter 1
2. Attached to: **Host-only Adapter**
3. Name: **vboxnet0** (or created adapter name)

---

## Operating System Installation

Perform these steps for **both VMs**.

### 1. Attach Ubuntu ISO

1. Select VM → **Settings** → **Storage**
2. Under "Controller: IDE", click **Empty**
3. Click disk icon → **Choose a disk file**
4. Select your **Ubuntu Server ISO**
5. Click **OK**

### 2. Start VM and Install Ubuntu

1. Select VM → Click **Start**

2. **Welcome Screen**:
   - Select language: English
   - Press Enter

3. **Installer Update**: 
   - Select "Continue without updating"

4. **Keyboard**:
   - Layout: English (US)
   - Variant: English (US)

5. **Network**:
   - Should show `enp0s3` with DHCP
   - Note: IP will be assigned automatically
   - Continue

6. **Proxy**: Leave blank → Continue

7. **Mirror**: Use default → Continue

8. **Storage**:
   - Use entire disk
   - Continue → Confirm

9. **Profile Setup**:
   - Your name: `vccuser`
   - Server name: `user-service-vm` (or `product-service-vm`)
   - Username: `vccuser`
   - Password: Choose a password
   - Continue

10. **SSH Setup**:
    - ✅ Install OpenSSH server
    - Continue

11. **Featured Snaps**:
    - Don't select any
    - Continue

12. **Installation**:
    - Wait for installation to complete
    - Select "Reboot Now"

13. **Post-Reboot**:
    - Remove installation medium (VirtualBox does automatically)
    - Press Enter
    - Wait for login prompt

### 3. Login

```
Username: vccuser
Password: [your password]
```

### 4. Get VM IP Address

```bash
ip addr show
```

Look for `enp0s3` and note the IP address (e.g., `10.0.2.4`).

**Important**: Note the IP addresses for both VMs:
- VM1 (user-service-vm): `10.0.2.4`
- VM2 (product-service-vm): `10.0.2.5`

---

## Node.js Installation

Perform on **both VMs**.

### 1. SSH into VM (Optional but recommended)

From host machine:
```bash
ssh vccuser@<VM-IP>
```

### 2. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Install Node.js 18

```bash
# Install curl if not present
sudo apt install -y curl

# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

### 4. Install PM2 Process Manager

```bash
sudo npm install -g pm2
pm2 --version
```

### 5. Install Git

```bash
sudo apt install -y git
git --version
```

---

## Service Deployment

### Deploy User Service on VM1

#### 1. SSH into VM1

```bash
ssh vccuser@<VM1-IP>
```

#### 2. Clone Repository

```bash
cd ~
git clone <your-github-repo-url>
cd microservice-vcc/user-service
```

Or if using SCP from host:
```bash
# On host machine
scp -r user-service vccuser@<VM1-IP>:~/
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Test Service

```bash
npm start
```

You should see:
```
==================================================
🚀 User Service is running
📡 Port: 3001
🏥 Health check: http://localhost:3001/health
📚 API Base: http://localhost:3001/api/users
==================================================
```

Press `Ctrl+C` to stop.

#### 5. Start with PM2

```bash
pm2 start server.js --name user-service
pm2 status
```

#### 6. Configure Auto-Start on Reboot

```bash
pm2 startup systemd
# Copy and run the command it outputs

pm2 save
```

#### 7. View Logs (if needed)

```bash
pm2 logs user-service
```

---

### Deploy Product Service on VM2

#### 1. SSH into VM2

```bash
ssh vccuser@<VM2-IP>
```

#### 2. Clone Repository

```bash
cd ~
git clone <your-github-repo-url>
cd microservice-vcc/product-service
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Configure User Service URL

Create a `.env` file or export environment variable:

```bash
# Create .env file
echo "USER_SERVICE_URL=http://<VM1-IP>:3001" > .env
```

Or export directly:
```bash
export USER_SERVICE_URL=http://<VM1-IP>:3001
```

Replace `<VM1-IP>` with actual VM1 IP (e.g., `10.0.2.4`).

#### 5. Start with PM2

```bash
pm2 start server.js --name product-service
pm2 status
```

If using environment variable:
```bash
pm2 start server.js --name product-service --update-env -- USER_SERVICE_URL=http://<VM1-IP>:3001
```

#### 6. Configure Auto-Start

```bash
pm2 startup systemd
# Run the command it outputs

pm2 save
```

---

## Testing and Verification

### 1. Test from Within VMs

#### On VM1 (User Service)
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/users
```

#### On VM2 (Product Service)
```bash
curl http://localhost:3002/health
curl http://localhost:3002/api/products

# Test inter-service communication
curl http://localhost:3002/api/products/1/with-owner
```

### 2. Test from Host Machine

Open terminal on host machine:

```bash
# Test User Service
curl http://<VM1-IP>:3001/health
curl http://<VM1-IP>:3001/api/users

# Test Product Service
curl http://<VM2-IP>:3002/health
curl http://<VM2-IP>:3002/api/products

# Test inter-service communication
curl http://<VM2-IP>:3002/api/products/1/with-owner
```

### 3. Test CRUD Operations

#### Create User
```bash
curl -X POST http://<VM1-IP>:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","role":"User"}'
```

#### Create Product
```bash
curl -X POST http://<VM2-IP>:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":99.99,"category":"Test","stock":10,"ownerId":1}'
```

#### Update User
```bash
curl -X PUT http://<VM1-IP>:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

#### Delete Product
```bash
curl -X DELETE http://<VM2-IP>:3002/api/products/4
```

### 4. Access from Browser

Open browser on host machine:
- User Service: `http://<VM1-IP>:3001/api/users`
- Product Service: `http://<VM2-IP>:3002/api/products`

---

## Troubleshooting

### Issue: Cannot connect to services from host

**Solution 1: Check Firewall**
```bash
# On both VMs
sudo ufw status
sudo ufw allow 3001  # On VM1
sudo ufw allow 3002  # On VM2
sudo ufw enable
```

**Solution 2: Verify Service is Running**
```bash
pm2 status
pm2 logs [service-name]
```

**Solution 3: Check if Port is Listening**
```bash
sudo netstat -tulpn | grep node
# Or
sudo ss -tulpn | grep node
```

### Issue: Inter-service communication fails

**Check 1: Verify VM2 can reach VM1**
```bash
# From VM2
ping <VM1-IP>
curl http://<VM1-IP>:3001/health
```

**Check 2: Verify Environment Variable**
```bash
# On VM2
pm2 env product-service | grep USER_SERVICE_URL
```

**Check 3: Update Environment Variable**
```bash
pm2 delete product-service
pm2 start server.js --name product-service -- USER_SERVICE_URL=http://<VM1-IP>:3001
pm2 save
```

### Issue: Service crashes on startup

**View Logs**:
```bash
pm2 logs product-service --lines 50
```

**Common causes**:
- Port already in use
- Missing dependencies (`npm install`)
- Wrong Node.js version (`node --version`)

### Issue: Cannot SSH into VM

**Solution 1: Check SSH Service**
```bash
# On VM (via VirtualBox console)
sudo systemctl status ssh
sudo systemctl start ssh
```

**Solution 2: Verify IP Address**
```bash
ip addr show
```

### Issue: VM has no internet connection

**Check Network Adapter**:
1. VM Settings → Network
2. Ensure adapter is attached to NAT Network
3. Restart VM

**Test Connection**:
```bash
ping 8.8.8.8
ping google.com
```

---

## Recording Video Demo

When recording your video demonstration:

### 1. Introduction (1 min)
- Explain the microservice architecture
- Show architecture diagram

### 2. VirtualBox Setup (2 min)
- Show both VMs in VirtualBox
- Display network configuration
- Show each VM is running

### 3. Service Demonstration (5 min)
- SSH into VM1, show User Service running with `pm2 status`
- SSH into VM2, show Product Service running
- Show IP addresses with `ip addr`

### 4. API Testing (5 min)
- Test health checks for both services
- Demonstrate GET all users
- Demonstrate GET all products
- Create a new user
- Create a new product
- **Most important**: Demonstrate inter-service communication with `/api/products/1/with-owner`

### 5. Network Testing (2 min)
- Show connectivity from host to VMs
- Show connectivity between VMs (ping from VM2 to VM1)

### 6. Logs and Monitoring (1 min)
- Show PM2 logs: `pm2 logs`
- Show process status: `pm2 status`

---

## Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Verify inter-service communication
3. ✅ Take screenshots for documentation
4. ✅ Record video demonstration
5. ✅ Prepare architecture diagram
6. ✅ Write final report

## Support

For issues or questions, refer to:
- [README.md](../README.md) - Quick start guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
- VirtualBox documentation
- Node.js documentation
