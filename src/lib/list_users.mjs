import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function listUsers() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI found");
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = await db.collection('users').find().toArray();
    console.log("--- USERS REGISTERED ---");
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, TeamRole: ${u.teamRole}, WorkspaceId: ${u.workspaceId}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

listUsers();
