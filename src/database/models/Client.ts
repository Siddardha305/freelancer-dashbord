import mongoose, { Schema, model, models } from 'mongoose';

const ClientSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  niche: {
    type: String,
    default: 'General',
  },
  email: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
  },
  country: {
    type: String,
  },
  timezone: {
    type: String,
  },
  status: {
    type: String,
    default: 'Active',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  monthly_price: {
    type: Number,
    default: 0,
  },
  pricing_model: {
    type: String,
    default: 'monthly',
  },
  channel_link: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
  },
  notes: {
    type: String,
  },
  tags: {
    type: [String],
    default: [],
  },
  totalEarned: {
    type: Number,
    default: 0,
  },
  contractStartDate: {
    type: Date,
  },
  contractEndDate: {
    type: Date,
  },
  lastContactedAt: {
    type: Date,
  },
  referredBy: {
    type: String,
  },
  thumbnails_per_month: {
    type: Number,
    default: 0,
  },
  price_per_thumbnail: {
    type: Number,
    default: 0,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
}, {
  timestamps: true,
});

const Client = models.Client || model('Client', ClientSchema);

export default Client;

