import mongoose, { Schema, model, models } from 'mongoose';

const WorkSchema = new Schema({
  client: {
    type: String,
    required: [true, 'Client is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
  },
  deadline: {
    type: String,
    required: [true, 'Deadline is required'],
  },
  status: {
    type: String,
    default: 'To Do',
  },
  priority: {
    type: String,
    enum: ['Urgent', 'High', 'Normal', 'Low'],
    default: 'Normal',
  },
  attachments: {
    type: [String],
    default: [],
  },
  videoLink: {
    type: String,
    default: '',
  },
  estimatedHours: {
    type: Number,
    default: 0,
  },
  actualHours: {
    type: Number,
    default: 0,
  },
  revisions: {
    type: Number,
    default: 0,
  },
  approvedByClient: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  tags: {
    type: [String],
    default: [],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

if (models.Work && (!models.Work.schema.paths.assignedTo || !models.Work.schema.paths.reviewerId)) {
  delete (models as Record<string, unknown>).Work;
  if (mongoose.modelNames().includes('Work')) {
    mongoose.deleteModel('Work');
  }
}

const Work = models.Work || model('Work', WorkSchema);

export default Work;

