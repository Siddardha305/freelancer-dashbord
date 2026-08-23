import mongoose, { Schema, model, models } from 'mongoose';

const PredefinedPlanSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
  },
  thumbnailsCount: {
    type: Number,
    required: [true, 'Unit count is required'],
    min: 0,
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: 0,
  },
}, {
  timestamps: true,
});

const PredefinedPlan = models.PredefinedPlan || model('PredefinedPlan', PredefinedPlanSchema);

export default PredefinedPlan;
