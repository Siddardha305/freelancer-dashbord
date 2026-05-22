import mongoose, { Schema, model, models } from 'mongoose';

const PaymentSchema = new Schema({
  client: {
    type: String,
    required: [true, 'Client is required'],
  },
  amount: {
    type: String,
    required: [true, 'Amount is required'],
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  due_date: {
    type: String, // Kept for backward compatibility
  },
  dueDate: {
    type: Date,
  },
  payment_status: {
    type: String,
    default: 'Pending',
  },
  taxPercent: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentMethod: {
    type: String,
    enum: ['Bank', 'PayPal', 'Crypto', 'Cash'],
    default: 'Bank',
  },
  receiptUrl: {
    type: String,
  },
  reminderSentAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringDay: {
    type: Number,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
}, {
  timestamps: true,
});

const Payment = models.Payment || model('Payment', PaymentSchema);

export default Payment;

