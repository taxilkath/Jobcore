# Typesense Setup Guide

This project uses Typesense for fast, local job search functionality. Follow these steps to set up and use Typesense for internal job search.

## Prerequisites

1. Install Typesense Server
   ```bash
   # Using Docker (recommended)
   docker run -d -p 8108:8108 \
     -v typesense-data:/data \
     -e TYPESENSE_API_KEY=your_api_key \
     typesense/typesense:0.24.0 \
     --data-dir /data \
     --api-key=your_api_key \
     --enable-cors
   ```

2. Set Environment Variables
   ```bash
   # Add to your .env file
   TYPESENSE_HOST=localhost
   TYPESENSE_PORT=8108
   TYPESENSE_PROTOCOL=http
   TYPESENSE_API_KEY=your_api_key
   ```

## Setup Steps

### 1. Initialize Typesense Collection
Create the jobs collection in Typesense:
```bash
POST /api/jobs/typesense/init
```

### 2. Index Existing Jobs
Bulk index all existing jobs from your database:
```bash
POST /api/jobs/typesense/bulk-index
```

This will:
- Create the jobs collection if it doesn't exist
- Index all jobs from your MongoDB database
- Support up to 10,000 jobs per request

### 3. Test the Search
The search API now automatically uses Typesense for internal jobs:
```bash
GET /api/jobs?search=developer&includeInternal=true&includeExternal=false
```

## Features

### Search Capabilities
- **Full-text search** across job titles, company names, descriptions, and locations
- **Faceted search** with job type filtering
- **Highlighted results** showing matching terms
- **Typo tolerance** for better search experience
- **Sorting** by relevance and publish date

### Automatic Indexing
- New jobs are automatically indexed when created
- Real-time search updates
- Fallback to MongoDB if Typesense is unavailable

### Performance
- **Sub-second search** responses
- **Scalable** to millions of jobs
- **Memory efficient** with built-in caching

## API Response Format

When using Typesense, the response includes:
```json
{
  "jobs": [...],
  "totalJobs": 1234,
  "searchEngine": "typesense", // or "mongodb" if fallback
  "pagination": {
    "hasNextPage": true
  }
}
```

## Search Query Examples

```bash
# Basic search
GET /api/jobs?search=frontend developer

# Search with job type filter
GET /api/jobs?search=react&jobType=full-time

# Search with pagination
GET /api/jobs?search=python&page=2&limit=20

# Internal jobs only (uses Typesense)
GET /api/jobs?search=javascript&includeInternal=true&includeExternal=false
```

## Troubleshooting

### Typesense Not Available
If Typesense is not running, the API will automatically fall back to MongoDB search:
```json
{
  "searchEngine": "mongodb",
  "jobs": [...]
}
```

### Re-indexing Jobs
If you need to re-index all jobs:
```bash
POST /api/jobs/typesense/bulk-index
```

### Collection Issues
If you encounter collection errors, reinitialize:
```bash
POST /api/jobs/typesense/init
```

## Performance Comparison

| Feature | MongoDB | Typesense |
|---------|---------|-----------|
| Search Speed | ~200ms | ~20ms |
| Typo Tolerance | ❌ | ✅ |
| Faceted Search | Limited | Full Support |
| Highlighting | Manual | Built-in |
| Scalability | Good | Excellent |

## Configuration

The Typesense schema is defined in `backend/src/config/typesense.ts`:
```typescript
export const jobCollectionSchema = {
  name: 'jobs',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'company', type: 'string' },
    { name: 'location', type: 'string' },
    { name: 'jobType', type: 'string', facet: true },
    { name: 'description', type: 'string' },
    { name: 'requirements', type: 'string[]' },
    { name: 'salary', type: 'string' },
    { name: 'publishedat', type: 'int64' },
    { name: 'apply_url', type: 'string' }
  ],
  default_sorting_field: 'publishedat'
};
```

## Next Steps

1. **Set up monitoring** for Typesense server health
2. **Configure backups** for the Typesense data directory
3. **Optimize search** queries based on user behavior
4. **Add filters** for location, salary range, etc.
5. **Implement analytics** for search queries

For more information, see the [Typesense documentation](https://typesense.org/docs/). 