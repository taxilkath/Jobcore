import mongoose, { Document, Schema } from 'mongoose';
import { ICompany } from './Company';

export interface IJob extends Document {
  id?: string; // External job ID (e.g., workable_123)
  title: string;
  company: ICompany['_id'];
  location: string;
  description: string;
  description_html?: string;
  requirements: string[];
  salary?: number;
  publishedAt: Date;
  applicationUrl?: string;
  url?: string; // Apply URL for MongoDB jobs
  external?: boolean; // Whether this job is from an external source
}

const JobSchema: Schema = new Schema({
  id: { type: String, unique: true, sparse: true }, // External job ID, sparse allows multiple nulls
  title: { type: String, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  description_html: { type: String },
  requirements: [{ type: String, required: true }],
  salary: { type: Number },
  publishedAt: { type: Date, default: Date.now },
  applicationUrl: { type: String },
  url: { type: String }, // Apply URL for MongoDB jobs
  external: { type: Boolean, default: false }, // Whether this job is from an external source
});

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);