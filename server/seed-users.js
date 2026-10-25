import mongoose from 'mongoose';
import { User } from './src/models.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'node:dns';

dns.setServers(['8.8.8.8']);
dotenv.config();

const userNames = [
  'Yash Kumar',
  'Sarah Johnson',
  'Wei Chen',
  'Aisha Patel',
  'Marcus Williams',
  'Yuki Tanaka',
  'Carlos Rodriguez',
  'Fatima Al-Fayed',
  'Andrei Petrov',
  'Priya Sharma',
  'Oluwaseun Adeyemi',
  'Hans Müller',
  'Sofia Garcia',
  'Rajesh Kumar',
  'Min-seo Kim',
  'Isabella Costa',
  'Ahmed Hassan',
  'Emma Thompson',
  'Kenji Sato',
  'Maria Gonzalez'
];

const usernames = [
  'yahkuamr02006',
  'sarah.j88',
  'weichen.cn',
  'aisha.patel',
  'marcus.w',
  'yuki.tanaka',
  'carlos.rod',
  'fatima.al',
  'andrei.petrov',
  'priya.sharma',
  'seun.adeyemi',
  'hans.muller',
  'sofia.garcia',
  'rajesh.kumar',
  'minseo.kim',
  'isabella.costa',
  'ahmed.hassan',
  'emma.thompson',
  'kenji.sato',
  'maria.gonzalez'
];

const emailDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'protonmail.com'
];

const passwords = [
  'Password123!',
  'SecurePass456!',
  'MyPass789!',
  'Trekking2024!',
  'AdventureTime!',
  'MountainHike!',
  'NatureLover!',
  'WildExplorer!',
  'PeakClimber!',
  'TrailBlazer!',
  'SummitSeeker!',
  'ValleyWalker!',
  'ForestRanger!',
  'RiverRunner!',
  'SkyHigh!',
  'EarthRoamer!',
  'OceanVoyager!',
  'DesertDrifter!',
  'ArcticAdventurer!',
  'JungleExplorer!'
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateUser(index) {
  const name = userNames[index];
  const username = usernames[index];
  const domain = getRandomItem(emailDomains);
  const email = `${username}@${domain}`;
  const password = passwords[index];
  const passwordHash = await bcrypt.hash(password, 10);

  return {
    name,
    email,
    passwordHash,
    role: 'User',
    status: 'Active'
  };
}

async function seedUsers() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('ERROR: MONGODB_URI is not set in .env file');
      process.exit(1);
    }
    console.log('Connecting to cloud MongoDB:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Generate 20 users
    const users = [];
    for (let i = 0; i < 20; i++) {
      users.push(await generateUser(i));
    }

    await User.insertMany(users);
    console.log(`Successfully seeded ${users.length} users`);

    // Display all user details
    console.log('\n=== USER DETAILS ===\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Full Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${passwords[index]}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log('');
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
