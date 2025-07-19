import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  description?: string;
  logo_url?: string;
  jobportal_id?: mongoose.Types.ObjectId;
  slug?: string; // For external API identifiers (e.g., Workable slug)
  posting_count?: number; // Cached job count from external APIs
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  logo_url: { type: String },
  jobportal_id: { type: Schema.Types.ObjectId, ref: 'JobPortal' },
  slug: { type: String }, // For external API identifiers (e.g., Workable slug)
  posting_count: { type: Number, default: 0 }, // Cached job count from external APIs
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);