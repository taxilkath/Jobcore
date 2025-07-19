import mongoose, { Document, Schema } from 'mongoose';

export interface IUserJob extends Document {
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  applicationUrl?: string;
  applied: boolean;
  savedAt: Date;
  appliedAt?: Date;
  fullJobData?: any; // Store complete job data for external jobs
}

const UserJobSchema: Schema = new Schema({
  userId: { type: String, required: true },
  jobId: { type: String, required: true },
  jobTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  location: { type: String },
  applicationUrl: { type: String },
  applied: { type: Boolean, default: false },
  savedAt: { type: Date, default: Date.now },
  appliedAt: { type: Date },
  fullJobData: { type: Schema.Types.Mixed }, // Store complete job data for external jobs
});

// Create compound index to prevent duplicate saves
UserJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.models.UserJob || mongoose.model<IUserJob>('UserJob', UserJobSchema);