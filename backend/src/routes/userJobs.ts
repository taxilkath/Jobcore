import { Router } from 'express';
import { saveJob, getSavedJobs, removeSavedJob, checkIfJobSaved, getSavedJobsWithDetails, getAppliedJobsWithDetails, markJobAsApplied } from '../controllers/userJobController';

const router = Router();

// Save a job for a user
router.post('/save', saveJob);

// Get all saved jobs for a user
router.get('/user/:userId', getSavedJobs);

// Get saved jobs with full job details (only non-applied jobs)
router.get('/user/:userId/details', getSavedJobsWithDetails);

// Get applied jobs with details
router.get('/user/:userId/applied', getAppliedJobsWithDetails);

// Mark a job as applied
router.put('/user/:userId/job/:jobId/apply', markJobAsApplied);

// Remove a saved job
router.delete('/user/:userId/job/:jobId', removeSavedJob);

// Check if a job is saved by a user
router.get('/user/:userId/job/:jobId/check', checkIfJobSaved);

export default router; 