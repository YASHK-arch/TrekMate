import mongoose from 'mongoose';
import { User } from './src/models.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'node:dns';

dns.setServers(['8.8.8.8']);
dotenv.config();

const userNames = [
  // Chinese names
  'Li Wei',
  'Wang Fang',
  'Zhang Min',
  'Liu Yang',
  'Chen Xi',
  // Indian names
  'Rahul Sharma',
  'Priya Singh',
  'Amit Patel',
  'Neha Gupta',
  'Vikram Reddy',
  // Vietnamese names
  'Nguyen Van Minh',
  'Tran Thi Lan',
  'Pham Quoc Bao',
  'Le Hoang Anh',
  'Hoang Mai Linh',
  // Tamil names
  'Karthik Sivakumar',
  'Priya Balasubramaniam',
  'Suresh Ramanathan',
  'Anand Rajendran',
  'Kavitha Subramanian',
  // Russian names
  'Ivan Ivanov',
  'Elena Petrova',
  'Alexei Smirnov',
  'Olga Volkova',
  'Dmitri Kuznetsov'
];

const usernames = [
  'li.wei.cn',
  'wang.fang',
  'zhang.min',
  'liu.yang',
  'chen.xi',
  'rahul.sharma',
  'priya.singh',
  'amit.patel',
  'neha.gupta',
  'vikram.reddy',
  'nguyen.minh',
  'tran.lan',
  'pham.bao',
  'le.anh',
  'hoang.linh',
  'karthik.siva',
  'priya.bala',
  'suresh.raman',
  'anand.rajan',
  'kavitha.subra',
  'ivan.ivanov',
  'elena.petrova',
  'alexei.smirnov',
  'olga.volkova',
  'dmitri.kuznetsov'
];

const emailDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'protonmail.com'
];

const passwords = [
  'DragonFire!',
  'GoldenTiger!',
  'JadeMountain!',
  'SilverRiver!',
  'PhoenixRise!',
  'MumbaiLights!',
  'DelhiDreams!',
  'BangaloreBliss!',
  'ChennaiCharm!',
  'HyderabadHero!',
  'HanoiHarbor!',
  'SaigonSpirit!',
  'HalongBay!',
  'DaNangDream!',
  'HueHaven!',
  'MaduraiMagic!',
  'ChennaiClassic!',
  'TamilTradition!',
  'KeralaKing!',
  'TempleTrek!',
  'MoscowMetro!',
  'SaintPetersburg!',
  'RedSquare!',
  'KremlinKeep!',
  'SiberianSnow!'
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

async function seedAdditionalUsers() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('ERROR: MONGODB_URI is not set in .env file');
      process.exit(1);
    }
    console.log('Connecting to cloud MongoDB:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Generate 25 additional users (without clearing existing users)
    const users = [];
    for (let i = 0; i < 25; i++) {
      users.push(await generateUser(i));
    }

    await User.insertMany(users);
    console.log(`Successfully seeded ${users.length} additional users`);

    // Display all user details
    console.log('\n=== ADDITIONAL USER DETAILS ===\n');
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

seedAdditionalUsers();
