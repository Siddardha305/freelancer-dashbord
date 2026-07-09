import mongoose, { Schema, model, models } from 'mongoose';

const LeaveRequestSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
}, {
  timestamps: true,
});

const LeaveRequest = models.LeaveRequest || model('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;
