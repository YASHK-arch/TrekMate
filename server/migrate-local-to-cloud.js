import dns from 'node:dns';
dns.setServers(['8.8.8.8']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_URI = 'mongodb://localhost:27017/trekking_management';
const CLOUD_URI = process.env.MONGODB_URI;

console.log('Local URI:', LOCAL_URI);
console.log('Cloud URI:', CLOUD_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

async function sync() {
  console.log('\n--- Connecting to Local MongoDB ---');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('Connected to Local MongoDB');

  console.log('\n--- Connecting to Cloud MongoDB Atlas ---');
  const cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();
  console.log('Connected to Cloud MongoDB Atlas');

  const collections = ['users', 'trekstaffs', 'treks', 'admins'];

  for (const colName of collections) {
    const localDocs = await localConn.db.collection(colName).find({}).toArray();
    console.log(`\nLocal '${colName}' has ${localDocs.length} documents.`);

    if (localDocs.length > 0) {
      if (colName === 'admins') {
        // Only insert if not exists
        for (const admin of localDocs) {
          const exists = await cloudConn.db.collection('admins').findOne({ email: admin.email });
          if (!exists) {
            await cloudConn.db.collection('admins').insertOne(admin);
            console.log(`Inserted admin ${admin.email} to cloud`);
          } else {
            console.log(`Admin ${admin.email} already exists on cloud`);
          }
        }
      } else {
        // Clear and insert
        await cloudConn.db.collection(colName).deleteMany({});
        await cloudConn.db.collection(colName).insertMany(localDocs);
        console.log(`Successfully migrated ${localDocs.length} documents into cloud '${colName}'`);
      }
    }
  }

  // Also remove the empty 'trekking_management' collection on cloud if it exists
  const cloudCollections = await cloudConn.db.listCollections().toArray();
  const dummyCol = cloudCollections.find(c => c.name === 'trekking_management');
  if (dummyCol) {
    await cloudConn.db.collection('trekking_management').drop();
    console.log("Dropped unnecessary empty collection 'trekking_management'");
  }

  // Summary counts on cloud
  console.log('\n=== CLOUD ATLAS VERIFICATION ===');
  for (const colName of ['admins', 'users', 'trekstaffs', 'treks', 'bookings']) {
    const count = await cloudConn.db.collection(colName).countDocuments();
    console.log(`Cloud collection '${colName}': ${count} documents`);
  }

  await localConn.close();
  await cloudConn.close();
  console.log('\nMigration complete and connections closed.');
}

sync().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
