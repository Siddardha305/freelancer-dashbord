import { Schema, model, models } from 'mongoose';

const ContactMessageSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
  },
  replied: {
    type: Boolean,
    default: false,
  },
  replyText: {
    type: String,
  },
  repliedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const ContactMessage = models.ContactMessage || model('ContactMessage', ContactMessageSchema);

export default ContactMessage;
