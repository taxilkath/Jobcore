// File: api/proxy/[...path].ts
export const config = {
    runtime: 'edge',
  };
  
  export default async function handler(req: Request) {
    // Get the backend URL from the Vercel environment variable
    const backendApiUrl = process.env.BACKEND_API_URL;
  
    if (!backendApiUrl) {
      return new Response('Server configuration error: Backend API URL not set.', { status: 500 });
    }
  
    // Create a URL object from the incoming request to easily manipulate it
    const requestUrl = new URL(req.url);
  
    // Extract the path after '/api/proxy'
    const path = requestUrl.pathname.replace('/api/proxy', '');
  
    // Construct the full destination URL for your backend
    const destinationUrl = `${backendApiUrl}${path}${requestUrl.search}`;
  
    // Create a new request to forward to the destination
    const forwardedRequest = new Request(destinationUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      redirect: 'follow',
    });
  
    // Make the request and return the response
    return fetch(forwardedRequest);
  }