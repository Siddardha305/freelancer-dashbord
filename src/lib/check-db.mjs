import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI found in .env.local");
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const stats = await db.stats();
    
    console.log("--- DATABASE STATUS ---");
    console.log(`Database Name: ${stats.db}`);
    console.log(`Collections: ${stats.collections}`);
    console.log(`Total Objects: ${stats.objects}`);
    console.log(`Data Size: ${(stats.dataSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Storage Size: ${(stats.storageSize / (1024 * 1024)).toFixed(2)} MB`);
    
    // Check specific collections (case sensitive depending on your setup, usually lowercase or matching models)
    const clients = await db.collection('clients').countDocuments();
    const tasks = await db.collection('tasks').countDocuments();
    const payments = await db.collection('payments').countDocuments();
    
    console.log("\n--- RECORD COUNTS ---");
    console.log(`Clients: ${clients}`);
    console.log(`Tasks: ${tasks}`);
    console.log(`Payments: ${payments}`);
    
  } catch (e) {
    console.error("Connection failed:", e.message);
  } finally {
    await client.close();
  }
}

check();
