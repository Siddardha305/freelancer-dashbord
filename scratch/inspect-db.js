const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://Dashbo-ard:igo7A4hrvrbT7nKv@cluster0.6arbyrg.mongodb.net/freelanceos?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Define schemas
  const clientSchema = new mongoose.Schema({
    name: String,
    status: String,
    pricing_model: String,
    monthly_price: Number,
    price_per_thumbnail: Number,
    thumbnails_per_month: Number,
  }, { collection: 'clients' });

  const workSchema = new mongoose.Schema({
    client: String,
    title: String,
    status: String,
  }, { collection: 'works' });

  const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);
  const Work = mongoose.models.Work || mongoose.model('Work', workSchema);

  const activeClients = await Client.find({ status: 'Active' }).lean();
  console.log('--- Active Clients ---');
  console.log(JSON.stringify(activeClients, null, 2));

  const allWorks = await Work.find().lean();
  console.log('\n--- All Work Tasks ---');
  console.log(JSON.stringify(allWorks, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
