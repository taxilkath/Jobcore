# JobCore Docker Setup

This Docker setup provides a complete containerized environment for the JobCore job search application with all necessary services.

## Architecture

The application consists of the following services:

- **MongoDB**: Database for storing jobs, companies, and user data
- **Redis**: Caching layer for improved performance
- **Typesense**: Fast search engine for job search functionality
- **Backend**: Node.js/Express API server
- **Frontend**: React/Vite application
- **Nginx**: Reverse proxy for routing and load balancing

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- At least 4GB RAM available for containers

## Quick Start

1. **Clone the repository and navigate to the project root**

2. **Copy environment file**
   ```bash
   cp env.example .env
   ```

3. **Update environment variables**
   Edit `.env` file with your actual values:
   - Supabase credentials
   - OpenAI API key
   - Any other external service credentials

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Wait for services to be ready**
   ```bash
   docker-compose logs -f
   ```

6. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000
   - Direct Frontend: http://localhost:3000

## Service Details

### MongoDB
- **Port**: 27017
- **Username**: admin
- **Password**: password123
- **Database**: jobcore
- **Data**: Persisted in `mongodb_data` volume

### Redis
- **Port**: 6379
- **Password**: redis123
- **Data**: Persisted in `redis_data` volume

### Typesense
- **Port**: 8108
- **API Key**: xyz
- **Data**: Persisted in `typesense_data` volume

### Backend
- **Port**: 5000
- **Environment**: Production
- **Health Check**: http://localhost:5000/api/health

### Frontend
- **Port**: 3000 (direct), 80 (via nginx)
- **Built**: Static files served by nginx

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f [service_name]
```

### Rebuild services
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Reset all data
```bash
docker-compose down -v
docker-compose up -d
```

## Database Initialization

The MongoDB container automatically:
- Creates the `jobcore` database
- Sets up collections (jobs, companies, jobportals, userjobs, resumes)
- Creates performance indexes
- Creates application user

## Typesense Setup

After starting the services, initialize Typesense:

```bash
# Initialize collection
curl -X POST http://localhost:5000/api/jobs/typesense/init

# Bulk index existing jobs
curl -X POST http://localhost:5000/api/jobs/typesense/bulk-index
```

## Development Mode

For development with hot reloading:

```bash
# Start only infrastructure services
docker-compose up -d mongodb redis typesense

# Run backend locally
cd backend
npm install
npm start

# Run frontend locally
npm install
npm run dev
```

## Production Deployment

For production deployment:

1. **Update environment variables**
   - Set `NODE_ENV=production`
   - Use secure passwords
   - Configure proper domain names

2. **Enable HTTPS**
   - Uncomment HTTPS configuration in `nginx.conf`
   - Add SSL certificates to `./ssl/` directory

3. **Configure external services**
   - Use managed MongoDB (MongoDB Atlas)
   - Use managed Redis (Redis Cloud)
   - Use managed Typesense (Typesense Cloud)

## Monitoring

### Health Checks
- **Overall**: http://localhost/health
- **Backend**: http://localhost:5000/api/health
- **Frontend**: http://localhost:3000

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Resource Usage
```bash
docker stats
```

## Troubleshooting

### Services won't start
```bash
# Check Docker logs
docker-compose logs

# Check system resources
docker system df

# Rebuild containers
docker-compose build --no-cache
```

### Database connection issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh -u admin -p password123
```

### Search not working
```bash
# Check Typesense logs
docker-compose logs typesense

# Test Typesense API
curl http://localhost:8108/health
```

### Frontend build issues
```bash
# Check build logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend --no-cache
```

## Security Considerations

### Default Passwords
Change all default passwords in production:
- MongoDB: `password123`
- Redis: `redis123`
- Typesense: `xyz`

### Network Security
- Services communicate through isolated Docker network
- Only necessary ports are exposed
- Rate limiting configured on API endpoints

### File Permissions
- All services run as non-root users
- Proper file ownership and permissions

## Backup and Restore

### MongoDB Backup
```bash
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/jobcore?authSource=admin" --out=/tmp/backup
docker cp $(docker-compose ps -q mongodb):/tmp/backup ./backup
```

### MongoDB Restore
```bash
docker cp ./backup $(docker-compose ps -q mongodb):/tmp/backup
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/jobcore?authSource=admin" /tmp/backup/jobcore
```

## Contributing

1. Make changes to the codebase
2. Test locally with Docker
3. Update documentation if needed
4. Submit pull request

## Support

For issues and questions:
- Check the logs: `docker-compose logs`
- Review this documentation
- Check Docker and system resources
- Verify environment variables

---

**Note**: This setup is optimized for development and testing. For production use, consider using managed services for databases and additional security measures. 