import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  bio: {
    type: String,
    default: '',
  },
  currency: {
    type: String,
    default: 'INR',
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  plan: {
    type: String,
    enum: ['hobby', 'pro', 'agency'],
    default: 'hobby',
  },
  slackWebhookUrl: {
    type: String,
    default: null,
  },
  agencyName: {
    type: String,
    default: null,
  },
  agencyLogoUrl: {
    type: String,
    default: null,
  },
  agencyLogoDarkUrl: {
    type: String,
    default: null,
  },
  agencyScannerUrl: {
    type: String,
    default: null,
  },
  agencyBrandingMode: {
    type: String,
    enum: ['logo', 'text', 'both'],
    default: 'both',
  },
  workspaceType: {
    type: String,
    enum: ['video_editing', 'digital_marketing', 'photography', 'general'],
    default: 'video_editing',
  },
}, {
  timestamps: true,
});

// Clear stale cached model if it lacks the recently added agencyScannerUrl field
if (models.User && !models.User.schema.paths.agencyScannerUrl) {
  delete (models as any).User;
  if (mongoose.modelNames().includes('User')) {
    mongoose.deleteModel('User');
  }
}

const User = models.User || model('User', UserSchema);

export default User;
