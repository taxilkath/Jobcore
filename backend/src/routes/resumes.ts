// backend/src/routes/resumes.ts
import { Router } from 'express';
import multer from 'multer';
import { uploadResume, getUserResumes,deleteResume  } from '../controllers/resumeController';

const router = Router();
// Use multer's memoryStorage to handle the file in memory before sending to Vercel
const upload = multer({ storage: multer.memoryStorage() });

// A single endpoint to handle the entire upload process.
// We use `upload.any()` to flexibly accept the file from Uppy's FormData.
router.post('/upload', upload.any(), uploadResume);

router.get('/user/:userId', getUserResumes);
router.delete('/user/:userId/resume/:resumeId', deleteResume);

export default router;