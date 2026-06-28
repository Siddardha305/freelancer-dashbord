const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://Dashbo-ard:igo7A4hrvrbT7nKv@cluster0.6arbyrg.mongodb.net/freelanceos?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const paymentSchema = new mongoose.Schema({
    client: String,
    amount: String,
    invoiceDate: Date,
    isDeleted: Boolean,
    payment_status: String,
    createdAt: Date,
  }, { collection: 'payments' });

  const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

  // Find the first payment that does NOT have isDeleted: true
  const payment = await Payment.findOne({ isDeleted: { $ne: true } });
  if (!payment) {
    console.log('No active payment found to delete');
    await mongoose.disconnect();
    return;
  }

  console.log(`Soft-deleting payment: ${payment.client} (Amount: ${payment.amount}), ID: ${payment._id}`);

  // Perform raw update like deletePaymentAction does
  const res = await Payment.collection.updateOne(
    { _id: payment._id },
    { $set: { isDeleted: true } }
  );

  console.log('Raw Update Result:', res);

  // Retrieve and verify
  const updated = await Payment.findById(payment._id).lean();
  console.log('Verified Document in DB:', updated);

  await mongoose.disconnect();
}

run().catch(console.error);
