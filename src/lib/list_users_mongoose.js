const mongoose = require('mongoose');
const uri = "mongodb+srv://Dashbo-ard:igo7A4hrvrbT7nKv@cluster0.6arbyrg.mongodb.net/freelanceos?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  teamRole: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(uri);
    const users = await User.find().lean();
    console.log("--- DATABASE USERS ---");
    users.forEach(u => {
      console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, TeamRole: ${u.teamRole}`);
    });
  } catch(e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}
run();
