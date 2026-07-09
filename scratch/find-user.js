const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://Dashbo-ard:igo7A4hrvrbT7nKv@cluster0.6arbyrg.mongodb.net/freelanceos?retryWrites=true&w=majority';

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const parentUser = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId("6a0f572a6209e0ab208d140f") });
    
    if (parentUser) {
      console.log('Workspace owner found:');
      console.log(JSON.stringify({
        _id: parentUser._id,
        name: parentUser.name,
        email: parentUser.email,
        role: parentUser.role,
        plan: parentUser.plan
      }, null, 2));
    } else {
      console.log('No workspace owner found with ID: 6a0f572a6209e0ab208d140f');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

main();
