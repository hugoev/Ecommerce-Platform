# EC2 Deployment Guide

This guide will help you deploy the E-Commerce Platform to AWS EC2 and make it accessible to the internet.

## Prerequisites

- AWS EC2 instance (Ubuntu 20.04+ recommended)
- SSH access to your EC2 instance
- Domain name (optional, but recommended)
- Basic knowledge of Linux commands

## Step 1: EC2 Instance Setup

### 1.1 Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose Ubuntu Server 20.04 LTS or later
3. Select instance type (t2.micro for testing, t2.small+ for production)
4. Configure security group with these rules:
   - **Inbound Rules:**
     - SSH (22) - from your IP only
     - HTTP (80) - from anywhere (0.0.0.0/0)
     - HTTPS (443) - from anywhere (0.0.0.0/0) - optional for SSL
     - Custom TCP (8080) - from anywhere (0.0.0.0/0) - Backend API
     - Custom TCP (5173) - from anywhere (0.0.0.0/0) - Frontend (if not using reverse proxy)
5. Launch instance and save your key pair (.pem file)

### 1.2 Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 2: Install Dependencies

### 2.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes to take effect
exit
# Then SSH back in
```

### 2.3 Install Git

```bash
sudo apt install git -y
```

## Step 3: Clone and Configure Application

### 3.1 Clone Repository

```bash
cd ~
git clone https://github.com/hugoev/Ecommerce-Platform.git
cd Ecommerce-Platform
```

### 3.2 Create Environment File

```bash
cp .env.example .env
nano .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
POSTGRES_DB=ecommerce
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=your_secure_password_here

# JWT Configuration
# IMPORTANT: Generate a secure random string (at least 64 characters)
# You can generate one with: openssl rand -base64 64
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here_at_least_64_characters
JWT_EXPIRATION=86400
```

**Important:** Generate a secure JWT secret:

```bash
openssl rand -base64 64
```

### 3.3 Configure Frontend API URL

The frontend uses `VITE_API_BASE_URL` environment variable. You have two options:

**Option A: Set environment variable in Docker Compose (Recommended)**

Edit `docker-compose.yml` and add to the frontend service:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  container_name: ecommerce-frontend
  ports:
    - "80:80" # Changed from 5173:80 to use standard HTTP port
  environment:
    - VITE_API_BASE_URL=http://your-ec2-public-ip:8080
  depends_on:
    - backend
  restart: unless-stopped
```

**Option B: Build frontend with environment variable**

Edit `frontend/Dockerfile` to accept build args, or set it during build.

## Step 4: Deploy Application

### 4.1 Build and Start Services

```bash
cd ~/Ecommerce-Platform
docker compose up --build -d
```

This will:

- Build all Docker images
- Start PostgreSQL database
- Start Spring Boot backend
- Start React frontend (served by Nginx)
- Run everything in detached mode (-d)

### 4.2 Check Service Status

```bash
docker compose ps
docker compose logs -f  # View logs
```

### 4.3 Verify Services

- Frontend: `http://your-ec2-public-ip` (or port 80)
- Backend API: `http://your-ec2-public-ip:8080`
- Test API: `curl http://your-ec2-public-ip:8080/api/items`

## Step 5: Security Considerations

### 5.1 Firewall (UFW) - Optional

If you want to use UFW firewall:

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 8080/tcp # Backend API
sudo ufw enable
```

### 5.2 Update Security Group

Make sure your EC2 Security Group allows:

- Port 80 (HTTP) from 0.0.0.0/0
- Port 8080 (Backend API) from 0.0.0.0/0
- Port 22 (SSH) from your IP only

### 5.3 Change Default Passwords

After first login, change the default admin password:

- Default: `admin` / `admin123`
- Change through the admin dashboard

## Step 6: Optional - Domain Name Setup

### 6.1 Point Domain to EC2 IP

1. Go to your domain registrar
2. Add an A record pointing to your EC2 public IP
3. Wait for DNS propagation (can take up to 48 hours)

### 6.2 Update Environment Variables

If using a domain, update:

- `VITE_API_BASE_URL` to use your domain
- CORS settings if you want to restrict origins

## Step 7: Maintenance Commands

### View Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Restart Services

```bash
docker compose restart
```

### Stop Services

```bash
docker compose down
```

### Update Application

```bash
cd ~/Ecommerce-Platform
git pull
docker compose up --build -d
```

### Backup Database

```bash
docker compose exec db pg_dump -U ecommerce_user ecommerce > backup.sql
```

## Troubleshooting

### Services Won't Start

- Check logs: `docker compose logs`
- Verify ports aren't in use: `sudo netstat -tulpn | grep LISTEN`
- Check Docker: `docker ps -a`

### Can't Access from Internet

- Verify Security Group rules
- Check EC2 instance is running
- Verify services are running: `docker compose ps`

### CORS Errors

- The application is now configured to allow all origins
- If you see CORS errors, check backend logs

### Database Connection Issues

- Verify database container is running: `docker compose ps db`
- Check database logs: `docker compose logs db`
- Verify environment variables in `.env` file

## Important Notes

1. **CORS Configuration**: The application is now configured to allow all origins (`*`). For production, consider restricting to specific domains for better security.

2. **JWT Secret**: Make sure to use a strong, random JWT secret (at least 64 characters).

3. **Database Password**: Use a strong password for the database.

4. **HTTPS**: For production, set up SSL/TLS certificates (Let's Encrypt) and use HTTPS.

5. **Backups**: Regularly backup your database.

6. **Monitoring**: Consider setting up CloudWatch or similar monitoring.

## Accessing the Application

Once deployed:

- **Frontend**: `http://your-ec2-public-ip` or `http://your-domain.com`
- **Backend API**: `http://your-ec2-public-ip:8080/api/items`
- **Admin Login**: Use the demo credentials or register a new account

Default Admin Credentials:

- Username: `admin`
- Password: `admin123`

**⚠️ Change this immediately after first login!**
