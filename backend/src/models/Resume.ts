// backend/src/models/Resume.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: string;
  fileName: string;
  filePath: string; // Will store the Vercel Blob URL
  fileSize: number;
  mimeType: string;
  textContent: string;
  jsonContent?: object; // Add this new field for the structured JSON
  createdAt: Date;
}

const ResumeSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  textContent: { type: String, required: false }, // Store the parsed text
  jsonContent: { type: Schema.Types.Mixed, required: false }, // Store the parsed JSON
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IResume>('Resume', ResumeSchema);