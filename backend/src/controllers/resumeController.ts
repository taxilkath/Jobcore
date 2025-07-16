// backend/src/controllers/resumeController.ts
import { put, del } from '@vercel/blob'; // Import the 'del' function
import { Request, Response } from 'express';
import Resume from '../models/Resume';
import { parseResume } from '../services/parsingService'; // Import the new service
import { parseResumeToJson } from '../services/aiService'; // Import the new AI service


export const uploadResume = async (req: Request, res: Response): Promise<any> => {
  const file = Array.isArray(req.files) ? req.files[0] : undefined;
  if (!file) return res.status(400).json({ message: 'No file uploaded.' });

  const { originalname, buffer, mimetype, size } = file;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required.' });

  try {
    const textContent = await parseResume(buffer, mimetype);
    const blob = await put(originalname, buffer, { access: 'public', addRandomSuffix: true });

    const newResume = new Resume({
      userId,
      fileName: originalname,
      filePath: blob.url,
      fileSize: size,
      mimeType: mimetype,
      textContent: textContent,
      // We initially save jsonContent as null
      jsonContent: null,
    });
    await newResume.save();
    
    // Respond to the user immediately for a fast experience
    res.status(201).json({
      message: 'Resume upload started! Parsing is in progress.',
      resume: newResume,
    });

    // --- Asynchronous Part ---
    // Now, parse to JSON in the background and update the document.
    (async () => {
      try {
        const jsonContent = await parseResumeToJson(textContent);
        await Resume.findByIdAndUpdate(newResume._id, { jsonContent });
        console.log(`Successfully parsed and saved JSON for resume: ${newResume._id}`);
      } catch (e) {
        console.error("Background JSON parsing failed:", e);
      }
    })();
    
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserResumes = async (req: Request, res: Response): Promise<any> => {
  // This function remains the same
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ resumes });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching resumes.' });
  }
};

export const deleteResume = async (req: Request, res: Response): Promise<any> => {
  const { userId, resumeId } = req.params;

  if (!userId || !resumeId) {
    return res.status(400).json({ message: 'User ID and Resume ID are required.' });
  }

  try {
    // Find the resume document in your database
    const resume = await Resume.findOne({ _id: resumeId, userId: userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or user unauthorized.' });
    }

    // 1. Delete the file from Vercel Blob using its URL
    await del(resume.filePath);

    // 2. Delete the record from your MongoDB database
    await Resume.findByIdAndDelete(resumeId);

    return res.status(200).json({ message: 'Resume deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting resume:', error);
    return res.status(500).json({ message: 'Server error while deleting resume.' });
  }
};