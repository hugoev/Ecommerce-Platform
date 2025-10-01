# Ecommerce Platform - EC2 Deployment Guide

This guide explains how to deploy your full-stack ecommerce application to an Amazon EC2 instance with image upload functionality.

## 🚀 Quick Deployment

1. **Launch an EC2 instance** (Ubuntu 22.04 LTS or Amazon Linux 2 recommended)
2. **SSH into your instance**
3. **Run the deployment script**:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/your-username/Ecommerce-Platform/main/deploy-ec2.sh | bash
   ```

## 📋 Prerequisites

- **EC2 Instance**: t3.medium or larger recommended
- **Security Group**: Allow ports 80, 443, 8080 (backend), and 5432 (PostgreSQL)
- **Internet Access**: Required for package installations

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Spring Boot    │    │   PostgreSQL    │
│   (Port 80)     │◄──►│   Backend       │◄──►│   Database      │
│                 │    │   (Port 8080)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   File System   │
                       │   /uploads/     │
                       │   images/       │
                       └─────────────────┘
```

## 🖼️ Image Upload System

### How It Works

1. **Frontend**: Admin users can upload images via the product management interface
2. **Backend**: Images are stored in `/app/backend/uploads/images/` directory
3. **Serving**: Images are served via `/images/` endpoint by Spring Boot
4. **URLs**: Uploaded images are accessible at `http://your-ec2-ip/images/filename.jpg`

### File Storage

- **Location**: `/app/backend/uploads/images/`
- **Permissions**: 755 (readable by web server)
- **File Types**: JPG, PNG, GIF (up to 5MB each)
- **Naming**: UUID-based unique filenames

## 🔧 Manual Deployment Steps

If you prefer manual deployment:

### 1. Install Dependencies

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Java 17
sudo apt install -y openjdk-17-jdk

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Database Setup

```bash
# Create database user and database
sudo -u postgres psql -c "CREATE USER ecommerce_user WITH PASSWORD 'ecommerce_password';"
sudo -u postgres psql -c "CREATE DATABASE ecommerce OWNER ecommerce_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce_user;"

# Test connection
psql -h localhost -U ecommerce_user -d ecommerce -c "SELECT 1;"
```

### 3. Application Setup

```bash
# Clone repository (replace with your repo URL)
git clone https://github.com/your-username/Ecommerce-Platform.git
cd Ecommerce-Platform

# Create uploads directory
mkdir -p backend/uploads/images
chmod 755 backend/uploads backend/uploads/images

# Build and start with Docker Compose
docker-compose up --build -d

# Run database migrations
docker-compose exec backend ./mvnw flyway:migrate
```

## 🌐 Accessing Your Application

After deployment, access your application at:

- **Frontend**: `http://your-ec2-public-ip`
- **Backend API**: `http://your-ec2-public-ip:8080`
- **API Documentation**: `http://your-ec2-public-ip:8080/swagger-ui.html`
- **Images**: `http://your-ec2-public-ip/images/filename.jpg`

## 📸 Image Upload Features

### Admin Interface

- **Location**: Admin Dashboard → Product Management → Add/Edit Product
- **Features**:
  - File upload button with drag & drop support
  - Image preview and validation
  - Support for JPG, PNG, GIF files
  - Maximum file size: 5MB
  - Automatic URL generation

### API Endpoints

```bash
# Upload image
POST /api/items/upload-image
Content-Type: multipart/form-data
Body: file=<image_file>

# Response
{
  "success": true,
  "data": "/images/unique-filename.jpg",
  "message": "Image uploaded successfully"
}
```

## 🔒 Security Considerations

### File Upload Security

- ✅ File type validation (images only)
- ✅ File size limits (5MB max)
- ✅ Unique filename generation (UUID)
- ✅ Path traversal protection

### Database Security

- ✅ Parameterized queries
- ✅ Input validation
- ✅ SQL injection protection

### API Security

- ✅ JWT authentication required
- ✅ Role-based access control
- ✅ CORS configuration

## 🛠️ Troubleshooting

### Common Issues

**Application won't start:**

```bash
# Check logs
docker-compose logs backend

# Check if port 8080 is in use
sudo lsof -i :8080
sudo kill -9 <PID>
```

**Database connection fails:**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U ecommerce_user -d ecommerce
```

**Images not uploading:**

```bash
# Check permissions
ls -la backend/uploads/

# Check if directory exists
mkdir -p backend/uploads/images
chmod 755 backend/uploads backend/uploads/images
```

**Frontend can't connect to backend:**

```bash
# Check CORS configuration in WebConfig.java
# Update allowed origins to include your domain
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
docker-compose down
docker-compose up --build -d

# Run migrations if needed
docker-compose exec backend ./mvnw flyway:migrate
```

### Backup Strategy

```bash
# Database backup
docker-compose exec db pg_dump -U ecommerce_user ecommerce > backup.sql

# Files backup (images)
tar -czf images-backup.tar.gz backend/uploads/
```

## 📊 Monitoring

### Check Application Status

```bash
# All services
docker-compose ps

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Resource usage
docker stats
```

### Database Monitoring

```bash
# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Check table sizes
sudo -u postgres psql -c "\dt+"
```

## 💰 Cost Optimization

For a school project, consider these optimizations:

1. **Instance Type**: Use `t3.micro` (free tier eligible)
2. **Storage**: Use gp3 EBS for cost efficiency
3. **Monitoring**: Use CloudWatch free tier
4. **Auto-scaling**: Not needed for school project scale

## 🚨 Important Notes

- **Domain**: Configure a domain name for better user experience
- **HTTPS**: Set up SSL certificate (Let's Encrypt free)
- **Backups**: Implement automated backup strategy
- **Monitoring**: Set up basic monitoring and alerting
- **Security**: Keep the instance updated and secure

---

🎓 **School Project Deployment Complete!** Your ecommerce platform with image upload functionality is now ready for deployment on EC2.
