import mongoose, { Schema, model, models } from 'mongoose';

const TimeLogSchema = new Schema({
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
  clockIn: {
    type: Date,
    required: true,
  },
  clockOut: {
    type: Date,
    default: null,
  },
  durationMinutes: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const TimeLog = models.TimeLog || model('TimeLog', TimeLogSchema);

export default TimeLog;
