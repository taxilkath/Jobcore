# Typesense Setup Guide

## Prerequisites

1. Install and run Typesense server locally:
```bash
# Using Docker
docker run -p 8108:8108 -v/tmp/typesense-data:/data typesense/typesense:0.25.1 \
  --data-dir /data --api-key=xyz --enable-cors

# Or download binary from https://typesense.org/docs/guide/install-typesense.html
```

## Environment Variables

### Backend (.env in backend folder)
```
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

### Frontend (.env in root folder)
```
VITE_TYPESENSE_HOST=localhost
VITE_TYPESENSE_PORT=8108
VITE_TYPESENSE_PROTOCOL=http
VITE_TYPESENSE_SEARCH_API_KEY=xyz
```

## Setup Steps

1. Start Typesense server
2. Start your backend server (it will auto-create the collection)
3. Index existing jobs by calling:
```bash
curl -X POST http://localhost:5000/api/jobs/bulk-index
```
4. Start frontend - it will now use Typesense for search!

## Features

- ✅ Backend uses Typesense with MongoDB fallback
- ✅ Frontend uses Typesense directly for faster search
- ✅ Auto-initialization of collections
- ✅ Bulk indexing of existing jobs
- ✅ Real-time search with highlighting
- ✅ Job type filtering
- ✅ Graceful fallbacks if Typesense is unavailable

## Testing

Search will now be powered by Typesense for lightning-fast results! 