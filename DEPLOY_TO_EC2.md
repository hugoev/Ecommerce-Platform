# Quick EC2 Deployment Guide

This is a streamlined guide to deploy your Ecommerce Platform to AWS EC2.

## Prerequisites

- AWS account with EC2 access
- SSH key pair (.pem file)
- Basic knowledge of Linux commands

## Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. **Choose AMI**: Ubuntu Server 22.04 LTS (or 20.04)
3. **Instance Type**: 
   - `t3.micro` (free tier) for testing
   - `t3.small` or larger for production
4. **Key Pair**: Create or select an existing key pair (save the .pem file!)
5. **Network Settings**: 
   - Create security group with these **Inbound Rules**:
     - SSH (22) - from your IP only
     - HTTP (80) - from anywhere (0.0.0.0/0)
     - Custom TCP (8080) - from anywhere (0.0.0.0/0) - Backend API
6. **Storage**: 20GB minimum (gp3 recommended)
7. Launch instance

## Step 2: Connect to EC2 Instance

```bash
# Replace with your key file and EC2 IP
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 3: Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes
exit
# Then SSH back in
```

## Step 4: Clone Repository

```bash
cd ~
git clone https://github.com/hugoev/Ecommerce-Platform.git
cd Ecommerce-Platform
```

## Step 5: Create Environment File

```bash
# Get your EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "Your EC2 IP is: $EC2_IP"

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 64)

# Create .env file
cat > .env << EOF
# Database Configuration
POSTGRES_DB=ecommerce
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=86400

# Frontend API Base URL - IMPORTANT: Replace with your EC2 IP
VITE_API_BASE_URL=http://$EC2_IP:8080
EOF

# Verify the file was created
cat .env
```

**Important**: Make sure `VITE_API_BASE_URL` uses your actual EC2 public IP address!

## Step 6: Create Uploads Directory

```bash
mkdir -p backend/uploads/images
chmod 755 backend/uploads backend/uploads/images
```

## Step 7: Deploy Application

```bash
# Build and start all services
docker compose up --build -d

# Wait for services to start (about 30-60 seconds)
sleep 30

# Check service status
docker compose ps

# View logs if needed
docker compose logs -f
```

## Step 8: Verify Deployment

```bash
# Get your EC2 IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Test backend API
curl http://$EC2_IP:8080/api/items

# Test frontend
curl http://$EC2_IP
```

## Step 9: Access Your Application

- **Frontend**: `http://your-ec2-public-ip`
- **Backend API**: `http://your-ec2-public-ip:8080`
- **API Docs**: `http://your-ec2-public-ip:8080/swagger-ui.html`

### Default Login Credentials

- **Admin**: `admin` / `admin123`
- **Test User**: `john_doe` / `password123`

⚠️ **Change these passwords immediately after first login!**

## Useful Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Restart services
docker compose restart

# Stop services
docker compose down

# Update application
cd ~/Ecommerce-Platform
git pull
docker compose up --build -d

# Backup database
docker compose exec db pg_dump -U ecommerce_user ecommerce > backup.sql
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker compose logs

# Check if ports are in use
sudo netstat -tulpn | grep LISTEN

# Restart Docker
sudo systemctl restart docker
```

### Can't access from internet
- Verify Security Group allows ports 80 and 8080 from 0.0.0.0/0
- Check EC2 instance is running
- Verify services: `docker compose ps`

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` in `.env` uses correct EC2 IP
- Rebuild frontend: `docker compose up --build -d frontend`

### Database connection issues
```bash
# Check database container
docker compose ps db
docker compose logs db

# Verify environment variables
cat .env
```

## Security Recommendations

1. **Change default passwords** immediately
2. **Set up HTTPS** with Let's Encrypt (free SSL)
3. **Restrict SSH access** to your IP only in Security Group
4. **Use strong passwords** for database and JWT secret
5. **Regular backups** of database and uploaded images
6. **Keep system updated**: `sudo apt update && sudo apt upgrade -y`

## Optional: Domain Name Setup

If you have a domain name:

1. Point your domain's A record to your EC2 public IP
2. Update `.env` file:
   ```bash
   VITE_API_BASE_URL=http://your-domain.com:8080
   # or for HTTPS:
   VITE_API_BASE_URL=https://your-domain.com:8080
   ```
3. Rebuild frontend:
   ```bash
   docker compose up --build -d frontend
   ```

## Cost Optimization

- Use `t3.micro` for free tier (limited performance)
- Stop instance when not in use to save costs
- Use gp3 EBS volumes (cheaper than gp2)
- Consider Reserved Instances for long-term use

---

**Deployment Complete!** 🎉

Your ecommerce platform should now be accessible from the internet.

