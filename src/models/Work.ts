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
    default: 'Medium',
  },
}, {
  timestamps: true,
});

const Work = models.Work || model('Work', WorkSchema);

export default Work;
