import mongoose, { Document, Schema } from 'mongoose';
import { ICompany } from './Company';

export interface IJobPortal extends Document {
  name: string;
  pattern: string;
  companies: ICompany['_id'][];
}

const JobPortalSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  pattern: { type: String, required: true },
  companies: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
});

export default mongoose.model<IJobPortal>('JobPortal', JobPortalSchema); 