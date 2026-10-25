import mongoose from 'mongoose';
import { TrekStaff } from './src/models.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'node:dns';

dns.setServers(['8.8.8.8']);
dotenv.config();

const staffNames = [
  'David Anderson',
  'Elena Volkov',
  'Kenji Yamamoto',
  'Maria Santos',
  'James Wilson',
  'Priya Nair',
  'Mohammed Ali',
  'Anna Kowalski',
  'Carlos Mendez',
  'Sven Johansson',
  'Yuki Nakamura',
  'Fatima Hassan',
  'Raj Patel',
  'Sophie Martin',
  'Lee Chang'
];

const staffUsernames = [
  'david.anderson',
  'elena.volkov',
  'kenji.yamamoto',
  'maria.santos',
  'james.wilson',
  'priya.nair',
  'mohammed.ali',
  'anna.kowalski',
  'carlos.mendez',
  'sven.johansson',
  'yuki.nakamura',
  'fatima.hassan',
  'raj.patel',
  'sophie.martin',
  'lee.chang'
];

const emailDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'protonmail.com'
];

const passwords = [
  'StaffPass123!',
  'GuideSecure!',
  'MountainGuide!',
  'TrekLeader2024!',
  'TrailMaster!',
  'PeakLeader!',
  'ValleyGuide!',
  'ForestGuide!',
  'RiverGuide!',
  'SummitGuide!',
  'AlpineGuide!',
  'ExpeditionLeader!',
  'NatureGuide!',
  'WildernessGuide!',
  'AdventureGuide!'
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateStaff(index) {
  const name = staffNames[index];
  const username = staffUsernames[index];
  const domain = getRandomItem(emailDomains);
  const contactDetails = `${username}@${domain}`;
  const password = passwords[index];
  const passwordHash = await bcrypt.hash(password, 10);

  return {
    name,
    contactDetails,
    passwordHash,
    role: 'Staff',
    status: 'Approved'
  };
}

async function seedStaff() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('ERROR: MONGODB_URI is not set in .env file');
      process.exit(1);
    }
    console.log('Connecting to cloud MongoDB:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing staff
    await TrekStaff.deleteMany({});
    console.log('Cleared existing staff');

    // Generate 15 staff members
    const staff = [];
    for (let i = 0; i < 15; i++) {
      staff.push(await generateStaff(i));
    }

    await TrekStaff.insertMany(staff);
    console.log(`Successfully seeded ${staff.length} staff members`);

    // Display all staff details
    console.log('\n=== STAFF DETAILS ===\n');
    staff.forEach((member, index) => {
      console.log(`${index + 1}. Full Name: ${member.name}`);
      console.log(`   Contact Email: ${member.contactDetails}`);
      console.log(`   Password: ${passwords[index]}`);
      console.log(`   Role: ${member.role}`);
      console.log(`   Status: ${member.status}`);
      console.log('');
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding staff:', error);
    process.exit(1);
  }
}

seedStaff();
