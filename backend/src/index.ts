import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import jobRoutes from './routes/jobs';
import userJobRoutes from './routes/userJobs';
import { searchService } from './services/searchService';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize database and search
const initializeServices = async () => {
  try {
    await connectDB();
    console.log('Database connected');
    
    // Try to initialize Typesense collection (optional)
    try {
      await searchService.initializeCollection();
      console.log('Typesense initialized successfully');
    } catch (typesenseError: any) {
      console.warn('Typesense not available - search will fall back to MongoDB:', typesenseError?.message || typesenseError);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1); // Exit only if database fails
  }
};

initializeServices();

app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobRoutes);
app.use('/api/user-jobs', userJobRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
}); 