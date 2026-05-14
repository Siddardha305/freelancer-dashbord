
import dbConnect from '../src/lib/mongodb';

async function testConnection() {
  try {
    console.log('Testing connection...');
    await dbConnect();
    console.log('Connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
