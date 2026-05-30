import { Schema, model, models } from 'mongoose';

const SupportTicketSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['billing', 'technical', 'feature_request', 'other'],
    default: 'technical',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  adminReply: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const SupportTicket = models.SupportTicket || model('SupportTicket', SupportTicketSchema);

export default SupportTicket;
