import { Client } from 'typesense';

const client = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108'),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http'
    }
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  connectionTimeoutSeconds: 2
});

// Job collection schema
export const jobCollectionSchema = {
  name: 'jobs',
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'title', type: 'string' as const },
    { name: 'company', type: 'string' as const },
    { name: 'location', type: 'string' as const },
    { name: 'jobType', type: 'string' as const, facet: true },
    { name: 'description', type: 'string' as const },
    { name: 'requirements', type: 'string[]' as const, optional: true },
    { name: 'salary', type: 'string' as const, optional: true },
    { name: 'publishedat', type: 'int64' as const },
    { name: 'apply_url', type: 'string' as const, optional: true }
  ],
  default_sorting_field: 'publishedat'
};

export default client; 