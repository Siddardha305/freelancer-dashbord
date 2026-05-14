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
  due_date: {
    type: String,
    required: [true, 'Due date is required'],
  },
  payment_status: {
    type: String,
    default: 'Pending',
  },
}, {
  timestamps: true,
});

const Payment = models.Payment || model('Payment', PaymentSchema);

export default Payment;
