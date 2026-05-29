# BharatVerify — Complete Deployment Guide
# From Zero → Live on the Internet

---

## WHAT YOU WILL HAVE AT THE END

```
Internet
   │
   ▼
Your Domain / IP
   │
   ├──► :80   → React Frontend (Nginx)
   ├──► :5000 → Node.js Backend (Express)
   ├──► :8000 → ML Forge Detection (FastAPI)
   └──► :8001 → ML OCR API (FastAPI)
                  │
                  ▼
             MongoDB (inside Docker, not exposed)
```

---

## PHASE 1 — AWS ACCOUNT & EC2 INSTANCE

---

### Step 1 — Create an AWS Account

1. Go to https://aws.amazon.com
2. Click **"Create an AWS Account"**
3. Fill in email, password, account name
4. Enter credit/debit card (you won't be charged for the free tier)
5. Verify phone number
6. Choose **"Basic Support – Free"**
7. Sign in to the AWS Console

---

### Step 2 — Launch an EC2 Instance

> **Why EC2?**  
> EC2 is like renting a computer in Amazon's data center.  
> Your project runs on that computer 24/7.

**2.1 — Open EC2 Dashboard**

- In the AWS Console search bar, type **EC2**
- Click **EC2** → Click **"Launch Instance"** (orange button)

**2.2 — Name your instance**

```
Name: bharatverify-server
```

**2.3 — Choose AMI (Operating System)**

- Select: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
- Architecture: **64-bit (x86)**

> Ubuntu 22.04 is a stable, widely supported Linux OS.  
> HVM = Hardware Virtual Machine (better performance).

**2.4 — Choose Instance Type**

| Your Use Case | Instance Type | vCPU | RAM | Cost (approx) |
|---|---|---|---|---|
| Testing only (no ML) | t3.small | 2 | 2 GB | ~$15/month |
| Backend + Frontend + DB | t3.medium | 2 | 4 GB | ~$30/month |
| ✅ RECOMMENDED (all services) | t3.large | 2 | 8 GB | ~$60/month |
| Heavy ML workload | t3.xlarge | 4 | 16 GB | ~$120/month |

**Select: t3.large**

> Why t3.large?  
> EasyOCR + PyTorch (your ML libraries) need at least 4–6 GB RAM.  
> With MongoDB + Node + 2 FastAPI services all running, 8 GB is safe.

**2.5 — Create a Key Pair (Your SSH Password File)**

- Click **"Create new key pair"**
- Key pair name: `bharatverify-key`
- Key pair type: **RSA**
- Private key file format: **.pem** (Mac/Linux) or **.ppk** (Windows PuTTY)
- Click **"Create key pair"** — a file downloads automatically
- ⚠️ **SAVE THIS FILE. You cannot download it again.**

> A key pair is like a physical key to your server.  
> The .pem file = your key. AWS keeps the lock (public key).

**2.6 — Configure Network Settings (Security Group)**

Click **"Edit"** next to Network settings, then:

- VPC: leave default
- Auto-assign public IP: **Enable**
- Create security group named: `bharatverify-sg`

Add these **Inbound Rules** (click "Add security group rule" for each):

| Type | Protocol | Port Range | Source | Purpose |
|---|---|---|---|---|
| SSH | TCP | 22 | My IP | Connect to server from your laptop |
| HTTP | TCP | 80 | 0.0.0.0/0 | Frontend web access |
| Custom TCP | TCP | 5000 | 0.0.0.0/0 | Backend API |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | ML Forge Detection |
| Custom TCP | TCP | 8001 | 0.0.0.0/0 | ML OCR API |
| Custom TCP | TCP | 27017 | 0.0.0.0/0 | MongoDB (optional — remove in production!) |

> Security groups = the firewall rules for your server.  
> We're opening ports so the internet can reach each service.

**2.7 — Configure Storage**

- Root volume: **30 GB** (gp3)
- Change from default 8 GB to 30 GB

> EasyOCR model files + Docker images + PyTorch = easily 8–10 GB.  
> 30 GB gives you enough breathing room.

**2.8 — Launch!**

- Click **"Launch Instance"**
- Wait ~1–2 minutes
- Click **"View Instances"**
- Wait until **Instance State = Running** and **Status checks = 2/2 passed**
- Copy the **Public IPv4 address** (e.g., `13.233.45.67`) — you'll use this everywhere

---

### Step 3 — Connect to Your Server (SSH)

**On Mac / Linux (Terminal):**

```bash
# First, fix the key file permissions (required by SSH)
chmod 400 ~/Downloads/bharatverify-key.pem

# Connect to your server
# Replace 13.233.45.67 with YOUR actual IP address
ssh -i ~/Downloads/bharatverify-key.pem ubuntu@13.233.45.67
```

**On Windows (using Git Bash or WSL):**

```bash
chmod 400 /c/Users/YourName/Downloads/bharatverify-key.pem
ssh -i /c/Users/YourName/Downloads/bharatverify-key.pem ubuntu@13.233.45.67
```

**On Windows (using PuTTY):**
1. Open PuTTY
2. Host Name: `ubuntu@13.233.45.67`
3. Connection → SSH → Auth → Browse for your .ppk file
4. Click Open

When you see `ubuntu@ip-172-xx-xx-xx:~$` — you're inside your server! ✅

---

## PHASE 2 — SERVER SETUP

---

### Step 4 — Update the Server

Run these commands one by one inside the SSH terminal:

```bash
# Update the list of available software
sudo apt update

# Upgrade installed software to latest versions
sudo apt upgrade -y

# Install useful tools
sudo apt install -y git curl wget unzip htop
```

> `sudo` = "run as administrator"  
> `apt` = Ubuntu's app store (command line version)  
> `-y` = say "yes" automatically to all prompts

---

### Step 5 — Install Docker

Docker is the tool that packages your app into containers.

```bash
# Download Docker's official installation script
curl -fsSL https://get.docker.com -o get-docker.sh

# Run the installation script
sudo sh get-docker.sh

# Add your user (ubuntu) to the docker group
# This lets you run docker without typing "sudo" every time
sudo usermod -aG docker ubuntu

# Apply the group change without logging out
newgrp docker

# Verify Docker is installed correctly
docker --version
# Expected output: Docker version 27.x.x, build xxxxxxx

# Verify Docker is running
sudo systemctl status docker
# Look for: "Active: active (running)"
```

---

### Step 6 — Install Docker Compose

Docker Compose lets you run all 5 services (frontend, backend, 2 ML services, MongoDB) with one command.

```bash
# Download Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify it works
docker compose version
# Expected output: Docker Compose version v2.x.x
```

---

### Step 7 — Install Node.js (for running npm commands directly if needed)

```bash
# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js version 20
nvm install 20
nvm use 20

# Verify
node --version   # v20.x.x
npm --version    # 10.x.x
```

---

## PHASE 3 — GITHUB REPOSITORY SETUP

Do this on your LOCAL laptop (not the server).

---

### Step 8 — Push Your Project to GitHub

**8.1 — Create a GitHub Repository**

1. Go to https://github.com → Click **"New"** (green button)
2. Repository name: `bharatverify`
3. Visibility: **Private** (recommended — your .env files might slip in!)
4. Do NOT initialize with README (your project already has one)
5. Click **"Create repository"**

**8.2 — Initialize Git in your project folder**

On your LOCAL laptop terminal:

```bash
# Navigate to your project folder (wherever you unzipped it)
cd path/to/BHARATVERIFY_AI_DRIVEN.IDENTITY_PROOF_CHECKER-DOC-new-version-2.0

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: BharatVerify project"

# Connect to GitHub (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/bharatverify.git

# Push
git branch -M main
git push -u origin main
```

**8.3 — Add the Dockerfiles and CI/CD file you got earlier**

Copy the files I generated into your project:

```
bharatverify/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          ← copy from outputs
├── backend/
│   └── Dockerfile             ← copy from outputs
├── frontend/
│   └── Dockerfile             ← copy from outputs
├── ML/
│   ├── forge_detection/
│   │   └── Dockerfile         ← copy from outputs
│   └── OCR_api/
│       └── Dockerfile         ← copy from outputs
└── docker-compose.yml         ← copy from outputs
```

Then push again:

```bash
git add .
git commit -m "Add Dockerfiles and CI/CD pipeline"
git push
```

---

### Step 9 — Create .env Files

**9.1 — Backend .env**

On your LOCAL laptop, inside the `backend/` folder, create a file named `.env`:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/bharatverify
JWT_SECRET=replace_this_with_a_long_random_string_abc123xyz789
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here
FORGE_DETECTION_URL=http://forge-detection:8000
OCR_API_URL=http://ocr-api:8001
```

> How to generate JWT_SECRET:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Copy the output and paste it as JWT_SECRET.

> How to get Gmail App Password:
> 1. Go to https://myaccount.google.com/security
> 2. Enable 2-Step Verification
> 3. Search "App passwords"
> 4. Create one for "Mail" → copy the 16-character password

**9.2 — ML Forge Detection .env**

Inside `ML/forge_detection/`, create `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Get your Gemini API key from: https://aistudio.google.com/app/apikey

**9.3 — ML OCR API .env**

Inside `ML/OCR_api/`, create `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**9.4 — Root .env (for Docker Compose)**

In the root of your project, create `.env`:

```env
JWT_SECRET=same_value_as_backend_env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://13.233.45.67:5000
```

Replace `13.233.45.67` with YOUR server's actual IP address.

**9.5 — Add .env files to .gitignore (CRITICAL)**

Make sure these are in your root `.gitignore`:

```gitignore
.env
.env.*
!.env.example
backend/.env
ML/forge_detection/.env
ML/OCR_api/.env
```

> ⚠️ NEVER push .env files to GitHub. Your API keys and passwords are inside them.

---

## PHASE 4 — DEPLOY ON THE SERVER

Back in your SSH terminal (connected to EC2).

---

### Step 10 — Clone the Repository on the Server

```bash
# Go to home directory
cd ~

# Clone your GitHub repo
git clone https://github.com/YOUR_USERNAME/bharatverify.git

# Enter the project folder
cd bharatverify

# Verify files are there
ls -la
```

---

### Step 11 — Create .env Files on the Server

The .env files were NOT pushed to GitHub (they're in .gitignore).  
You need to create them manually on the server.

```bash
# Create root .env
nano .env
```

Paste this (with your actual values):

```env
JWT_SECRET=your_jwt_secret_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://13.233.45.67:5000
```

Save: `Ctrl+O` → Enter → `Ctrl+X`

```bash
# Create backend .env
nano backend/.env
```

Paste:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/bharatverify
JWT_SECRET=your_jwt_secret_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
FORGE_DETECTION_URL=http://forge-detection:8000
OCR_API_URL=http://ocr-api:8001
```

Save: `Ctrl+O` → Enter → `Ctrl+X`

```bash
# Create forge detection .env
nano ML/forge_detection/.env
```

Paste:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Save: `Ctrl+O` → Enter → `Ctrl+X`

```bash
# Create OCR API .env
nano ML/OCR_api/.env
```

Paste:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Save: `Ctrl+O` → Enter → `Ctrl+X`

---

### Step 12 — Build and Start All Services

```bash
# Make sure you're in the project root
cd ~/bharatverify

# Build all Docker images and start containers
# --build = rebuild images from Dockerfiles
# -d = run in background (detached mode)
docker compose up --build -d
```

> ⚠️ First build will take 10–20 minutes.  
> EasyOCR downloads ~500 MB of model files.  
> PyTorch is another ~800 MB.  
> Grab a chai ☕

**Watch the build progress:**

```bash
# Stream live logs of the build
docker compose logs -f
```

Press `Ctrl+C` to stop watching logs (containers keep running).

---

### Step 13 — Verify Everything is Running

```bash
# Check all containers are UP
docker compose ps
```

Expected output:

```
NAME                          STATUS          PORTS
bharatverify-mongo            Up (healthy)    27017/tcp
bharatverify-backend          Up (healthy)    0.0.0.0:5000->5000/tcp
bharatverify-frontend         Up (healthy)    0.0.0.0:80->80/tcp
bharatverify-forge-detection  Up (healthy)    0.0.0.0:8000->8000/tcp
bharatverify-ocr-api          Up (healthy)    0.0.0.0:8001->8001/tcp
```

If any container shows "Exit" or "Restarting", check its logs:

```bash
docker compose logs backend        # check backend errors
docker compose logs forge-detection  # check ML service errors
docker compose logs mongo          # check database errors
```

**Test each service manually:**

```bash
# Test backend (should return "Hello World!")
curl http://localhost:5000

# Test forge detection API docs
curl http://localhost:8000/docs

# Test OCR API docs
curl http://localhost:8001/docs

# Test frontend
curl http://localhost:80
```

**Test from your browser (use your actual server IP):**

| Service | URL |
|---|---|
| Frontend | `http://13.233.45.67` |
| Backend | `http://13.233.45.67:5000` |
| Forge Detection API Docs | `http://13.233.45.67:8000/docs` |
| OCR API Docs | `http://13.233.45.67:8001/docs` |

---

### Step 14 — Common Problems and Fixes

**Problem: Port already in use**
```bash
sudo lsof -i :5000        # Find what's using port 5000
sudo kill -9 <PID>        # Kill it
docker compose up -d      # Restart
```

**Problem: Out of disk space**
```bash
df -h                     # Check disk usage
docker system prune -a    # Remove unused images/containers (frees space)
```

**Problem: Out of memory (containers crashing)**
```bash
free -h                   # Check RAM
# If consistently low RAM, upgrade to t3.xlarge on AWS
```

**Problem: ML service fails to start (EasyOCR error)**
```bash
docker compose logs forge-detection
# If you see "CUDA not available" — that's fine, it uses CPU automatically
# If you see import errors — the pip install may have failed:
docker compose build --no-cache forge-detection
docker compose up -d forge-detection
```

**Problem: MongoDB connection refused**
```bash
docker compose logs mongo
# Make sure mongo is "healthy" before backend starts
docker compose restart backend  # Usually fixes timing issues
```

---

## PHASE 5 — GITHUB ACTIONS CI/CD SETUP

Now set this up so every `git push` automatically redeploys.

---

### Step 15 — Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **"New repository secret"** for each:

| Secret Name | Value |
|---|---|
| `DOCKER_HUB_USERNAME` | Your Docker Hub username |
| `DOCKER_HUB_TOKEN` | Your Docker Hub access token (see below) |
| `VITE_API_URL` | `http://13.233.45.67:5000` |
| `JWT_SECRET` | Same value as your .env |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASSWORD` | Your Gmail app password |
| `GEMINI_API_KEY` | Your Gemini API key |
| `SSH_HOST` | `13.233.45.67` (your server IP) |
| `SSH_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | Contents of your bharatverify-key.pem file |

**How to get Docker Hub Access Token:**
1. Go to https://hub.docker.com
2. Sign up / Sign in
3. Click your avatar → Account Settings → Security
4. Click **"New Access Token"**
5. Name: `github-actions-bharatverify`
6. Permissions: Read, Write, Delete
7. Copy the token immediately (shown only once)

**How to get the SSH Private Key:**

On your LOCAL laptop:
```bash
# Print the contents of your .pem file
cat ~/Downloads/bharatverify-key.pem
```

Copy the ENTIRE output including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` and paste it as the `SSH_PRIVATE_KEY` secret.

---

### Step 16 — Update CI/CD File for Auto-Deploy

Update your `.github/workflows/ci-cd.yml` — find the deploy job and uncomment the SSH section:

```yaml
  deploy:
    name: 🚀 Deploy to Production
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/bharatverify
            git pull origin main
            docker compose pull
            docker compose up -d --build
            docker system prune -f
```

Push this change:

```bash
git add .github/workflows/ci-cd.yml
git commit -m "Enable SSH auto-deploy in CI/CD"
git push
```

---

### Step 17 — Test the CI/CD Pipeline

1. Go to your GitHub repo
2. Click **Actions** tab (top menu)
3. You should see a workflow run starting
4. Click on it to watch the steps live

Each green checkmark = that step passed ✅  
A red X = something failed → click it to see the error logs

**Full pipeline flow:**
```
git push
   │
   ▼
GitHub Actions triggers
   │
   ├── Job 1: test-backend  (npm ci + npm test)
   ├── Job 2: test-frontend (npm ci + lint + build)
   │
   ▼ (both pass)
   │
   ├── Job 3: build-and-push
   │    ├── Build backend image  → push to Docker Hub
   │    ├── Build frontend image → push to Docker Hub
   │    ├── Build forge-detection image → push to Docker Hub
   │    └── Build ocr-api image → push to Docker Hub
   │
   ▼ (all images pushed)
   │
   └── Job 4: deploy
        └── SSH into EC2 → git pull → docker compose up
```

---

## PHASE 6 — MONITORING & MAINTENANCE

---

### Step 18 — Useful Commands to Know

**Check running containers:**
```bash
docker compose ps
```

**View live logs of all services:**
```bash
docker compose logs -f
```

**View logs of one service:**
```bash
docker compose logs -f backend
docker compose logs -f forge-detection
```

**Restart a specific service:**
```bash
docker compose restart backend
docker compose restart forge-detection
```

**Stop everything:**
```bash
docker compose down
```

**Stop and remove all data (CAREFUL — deletes MongoDB data too):**
```bash
docker compose down -v
```

**Check server resource usage:**
```bash
htop          # CPU and RAM usage (press Q to quit)
df -h         # Disk usage
docker stats  # Per-container CPU and RAM live
```

**Update the project after code changes:**
```bash
cd ~/bharatverify
git pull origin main
docker compose up -d --build
```

---

### Step 19 — Make the Server Auto-Restart Docker on Reboot

If the EC2 instance restarts (e.g., after an AWS maintenance event), Docker should auto-start:

```bash
# Enable Docker to start on boot (already done by the get-docker.sh script)
sudo systemctl enable docker

# Create a systemd service that runs docker compose on boot
sudo nano /etc/systemd/system/bharatverify.service
```

Paste this:

```ini
[Unit]
Description=BharatVerify Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/bharatverify
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
```

Save: `Ctrl+O` → Enter → `Ctrl+X`

```bash
# Enable and start the service
sudo systemctl enable bharatverify
sudo systemctl start bharatverify

# Verify
sudo systemctl status bharatverify
```

---

## PHASE 7 — OPTIONAL: CUSTOM DOMAIN + HTTPS (SSL)

Skip this if you just want to test with the IP address.

---

### Step 20 — Point a Domain to Your Server

1. Buy a domain from GoDaddy / Namecheap / Google Domains (₹500–₹1000/year)
2. Go to your domain's DNS settings
3. Add an **A Record**:
   - Name: `@` (root domain) and `www`
   - Value: your EC2 IP (`13.233.45.67`)
   - TTL: 300

Wait 5–10 minutes for DNS to propagate.

---

### Step 21 — Install Nginx + Certbot for HTTPS

```bash
# Install Nginx (reverse proxy) and Certbot (free SSL from Let's Encrypt)
sudo apt install -y nginx certbot python3-certbot-nginx

# Stop the frontend container temporarily (it uses port 80)
docker compose stop frontend

# Configure Nginx
sudo nano /etc/nginx/sites-available/bharatverify
```

Paste (replace `bharatverify.yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name bharatverify.yourdomain.com www.bharatverify.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> NOTE: If you use a domain + Nginx, change the frontend container to port 3000
> and update the proxy_pass accordingly to avoid port 80 conflicts.

```bash
# Enable the config
sudo ln -s /etc/nginx/sites-available/bharatverify /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Get FREE SSL certificate (replace with your domain)
sudo certbot --nginx -d bharatverify.yourdomain.com -d www.bharatverify.yourdomain.com
```

Certbot will automatically add HTTPS to your Nginx config.  
Your site is now at: `https://bharatverify.yourdomain.com` 🔒

**Auto-renew SSL (Let's Encrypt certs expire every 90 days):**
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot automatically adds a cron job — you don't need to do anything else
```

---

## QUICK REFERENCE CARD

```
┌─────────────────────────────────────────────────────────┐
│               BHARATVERIFY QUICK REFERENCE              │
├─────────────────────────────────────────────────────────┤
│ SSH into server:                                        │
│   ssh -i bharatverify-key.pem ubuntu@YOUR_IP           │
│                                                         │
│ Start all services:                                     │
│   cd ~/bharatverify && docker compose up -d            │
│                                                         │
│ Stop all services:                                      │
│   docker compose down                                   │
│                                                         │
│ View logs:                                              │
│   docker compose logs -f                               │
│                                                         │
│ Update after code push:                                 │
│   git pull && docker compose up -d --build             │
│                                                         │
│ Check resource usage:                                   │
│   docker stats                                          │
├─────────────────────────────────────────────────────────┤
│ URLs (replace IP with your server IP):                  │
│   Frontend:  http://YOUR_IP                             │
│   Backend:   http://YOUR_IP:5000                        │
│   Forge API: http://YOUR_IP:8000/docs                   │
│   OCR API:   http://YOUR_IP:8001/docs                   │
└─────────────────────────────────────────────────────────┘
```

---

## COST ESTIMATE (AWS)

| Resource | Monthly Cost |
|---|---|
| EC2 t3.large | ~$60 |
| 30 GB EBS Storage | ~$3 |
| Data Transfer (first 100 GB free) | $0 |
| Elastic IP (if you add one) | ~$4 |
| **Total** | **~$67/month** |

> 💡 To save money while testing:  
> Stop the EC2 instance when not using it (you only pay for running time).  
> AWS Console → EC2 → Select instance → Instance State → Stop  
> Your data stays intact. Restart it when needed.

> 💡 For a hackathon / demo:  
> Use t3.medium (~$30/month) and skip the ML services (they're optional per README).  
> Host only backend + frontend + MongoDB on the same instance.
