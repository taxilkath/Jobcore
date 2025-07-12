# Backend API with Redis Caching

This backend API uses Redis Upstash for caching to improve performance and reduce database load.

## Features

- **Job Management**: Create, retrieve, and search jobs
- **Job Portals**: Manage job portals and their associated companies
- **External API Integration**: Fetch jobs from external job boards (Ashby, Lever, Greenhouse)
- **Redis Caching**: Automatic caching of API responses to improve performance

## Redis Upstash Setup

### 1. Create an Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or log in to your account
3. Click "Create Database"
4. Choose your preferred region
5. Give your database a name
6. Click "Create"

### 2. Get Your Redis Credentials

After creating your database:

1. Go to your database dashboard
2. Copy the **REST URL** and **REST TOKEN** from the "REST API" section

### 3. Configure Environment Variables

Add these variables to your `.env` file:

```env
# Redis Upstash Configuration
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Optional: Cache configuration
ENABLE_CACHE=true
CACHE_TTL_JOBS=300
CACHE_TTL_PORTALS=900
CACHE_TTL_COMPANIES=600
CACHE_TTL_EXTERNAL_JOBS=1800
```

### 4. Cache TTL Values

The application uses different cache TTL (Time To Live) values for different types of data:

- **Jobs**: 5 minutes (300 seconds)
- **Job Portals**: 15 minutes (900 seconds)
- **Companies**: 10 minutes (600 seconds)
- **External Jobs**: 30 minutes (1800 seconds)

## API Endpoints with Caching

### Cached Endpoints

- `GET /api/jobs` - Get jobs with search and pagination (cached for 5 minutes)
- `GET /api/jobs/portals` - Get job portals (cached for 15 minutes)
- `GET /api/jobs/portals/:portalName/companies` - Get companies by portal (cached for 10 minutes)
- `GET /api/jobs/companies/:companyId/external-jobs` - Get external company jobs (cached for 30 minutes)

### Non-Cached Endpoints

- `POST /api/jobs` - Create a new job (invalidates related caches)

## Cache Invalidation

When new jobs are created, the system automatically invalidates relevant caches:

- Job portals cache
- Jobs cache (various search combinations)
- Company-specific caches (if applicable)

## Running Without Redis

The application gracefully handles the absence of Redis credentials. If Redis is not configured:

- All cache operations will be skipped
- The application will continue to work normally without caching
- Warning messages will be logged indicating that caching is disabled

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables (including Redis credentials)

3. Start the server:
   ```bash
   npm start
   ```

## Cache Monitoring

Cache hits and misses are logged to the console:
- `Cache hit for key: [key]` - Data was found in cache
- `Cache miss for key: [key]` - Data was not in cache, fetched from database

## Development

To disable caching during development, simply remove the Redis environment variables from your `.env` file. The application will continue to work without caching. 