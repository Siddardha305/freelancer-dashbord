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
  status: {
    type: String,
    default: 'Active',
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
  thumbnails_per_month: {
    type: Number,
    default: 0,
  },
  price_per_thumbnail: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Client = models.Client || model('Client', ClientSchema);

export default Client;
