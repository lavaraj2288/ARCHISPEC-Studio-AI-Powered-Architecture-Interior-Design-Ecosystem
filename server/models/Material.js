import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['wood', 'stone', 'metal', 'paint', 'lighting', 'fabric'],
      lowercase: true
    },
    room: {
      type: String,
      required: true,
      enum: ['living', 'master_bedroom', 'kitchen', 'foyer', 'dining'],
      lowercase: true
    },
    specs: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      default: 'sq.ft'
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    laborRatePerUnit: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    textureGradient: {
      type: String,
      default: 'from-stone-100 via-neutral-200 to-slate-300 text-stone-900'
    },
    vendorCode: {
      type: String,
      default: 'VND-MUM-100'
    },
    leadTimeDays: {
      type: Number,
      default: 7
    },
    carbonScore: {
      type: String,
      enum: ['A+', 'A', 'B', 'C'],
      default: 'A'
    },
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Procured'],
      default: 'Approved'
    }
  },
  {
    timestamps: true
  }
);

// -------------------------------------------------------------
// Database Optimization & Compound Indexes (Recruiter Criteria 3)
// -------------------------------------------------------------
// 1. Compound index for rapid room & category filtered queries
MaterialSchema.index({ room: 1, category: 1 });

// 2. Compound index for status tracking and procurement workflows
MaterialSchema.index({ status: 1, room: 1 });

// 3. Full-text search index for real-time search across names, brands & specs
MaterialSchema.index({
  name: 'text',
  brand: 'text',
  specs: 'text'
});

export const Material = mongoose.model('Material', MaterialSchema);
export default Material;
