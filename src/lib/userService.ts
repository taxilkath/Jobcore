// Simple user service for managing user ID and saved jobs
// In a real app, this would integrate with authentication

// Get server URL from environment variable
const SERVER_URL = '/api/proxy';

// Generate or retrieve user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // Generate a simple UUID-like string
    userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// Save job API call
export const saveJobToAPI = async (jobData: {
  jobId: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  applicationUrl?: string;
  fullJobData?: any; // Include full job data for external jobs
}) => {
  const userId = getUserId();
  try {
    const response = await fetch(`${SERVER_URL}/api/user-jobs/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...jobData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save job');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

// Get saved jobs API call
export const getSavedJobsFromAPI = async () => {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${SERVER_URL}/api/user-jobs/user/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch saved jobs');
    }

    const result = await response.json();
    return result.savedJobs || [];
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    throw error;
  }
};

// Get saved job IDs for filtering purposes
export const getSavedJobIds = async (): Promise<string[]> => {
  try {
    const savedJobs = await getSavedJobsFromAPI();
    return savedJobs.map((job: any) => job.jobId);
  } catch (error) {
    console.error('Error fetching saved job IDs:', error);
    return [];
  }
};

// Create a callback registry for saved job updates
let savedJobUpdateCallbacks: (() => void)[] = [];

export const registerSavedJobUpdateCallback = (callback: () => void) => {
  savedJobUpdateCallbacks.push(callback);
  return () => {
    savedJobUpdateCallbacks = savedJobUpdateCallbacks.filter(cb => cb !== callback);
  };
};

export const notifySavedJobUpdate = () => {
  savedJobUpdateCallbacks.forEach(callback => callback());
};

// Updated save job function that notifies callbacks
export const saveJobToAPIWithCallback = async (jobData: {
  jobId: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  applicationUrl?: string;
  fullJobData?: any;
}) => {
  const result = await saveJobToAPI(jobData);
  notifySavedJobUpdate();
  return result;
};

// Get saved jobs with full details API call
export const getSavedJobsWithDetailsFromAPI = async () => {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${SERVER_URL}/api/user-jobs/user/${userId}/details`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch saved jobs with details');
    }

    const result = await response.json();
    return result.savedJobs || [];
  } catch (error) {
    console.error('Error fetching saved jobs with details:', error);
    throw error;
  }
};

// Remove saved job API call
export const removeSavedJobFromAPI = async (jobId: string) => {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${SERVER_URL}/api/user-jobs/user/${userId}/job/${jobId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to remove saved job');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error removing saved job:', error);
    throw error;
  }
};

// Get applied jobs with details API call
export const getAppliedJobsFromAPI = async () => {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${SERVER_URL}/api/user-jobs/user/${userId}/applied`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch applied jobs');
    }

    const result = await response.json();
    return result.appliedJobs || [];
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    throw error;
  }
};

// Mark job as applied API call
export const markJobAsAppliedAPI = async (jobId: string) => {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${SERVER_URL}/api/user-jobs/user/${userId}/job/${jobId}/apply`, {
      method: 'PUT'
    });

    if (!response.ok) {
      throw new Error('Failed to mark job as applied');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error marking job as applied:', error);
    throw error;
  }
};

// Check if job is saved API call
export const checkIfJobSavedAPI = async (jobId: string) => {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${SERVER_URL}/api/user-jobs/user/${userId}/job/${jobId}/check`);
    
    if (!response.ok) {
      throw new Error('Failed to check if job is saved');
    }

    const result = await response.json();
    return result.isSaved;
  } catch (error) {
    console.error('Error checking if job is saved:', error);
    return false;
  }
}; 