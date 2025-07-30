// File: api/proxy/[...path].ts

export const config = {
    runtime: 'edge',
  };
  
  export default async function handler(req: Request) {
    const backendApiUrl = process.env.BACKEND_API_URL;
  
    if (!backendApiUrl) {
      return new Response('Backend API URL is not configured.', { status: 500 });
    }
  
    // Create a new URL object from the incoming request
    const requestUrl = new URL(req.url);
  
    // Get the path from the URL (e.g., /api/proxy/jobs)
    const path = requestUrl.pathname.replace('/api/proxy', '');
  
    // Construct the full destination URL
    const destination = `${backendApiUrl}${path}${requestUrl.search}`;
  
    // Forward the request to your backend
    return fetch(destination, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      redirect: 'follow',
    });
  }