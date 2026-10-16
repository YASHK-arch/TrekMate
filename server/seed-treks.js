import mongoose from 'mongoose';
import { Trek } from './src/models.js';
import { trekImagesByRegion } from './src/trek-images.js';
import dotenv from 'dotenv';

dotenv.config();

const regions = [
  'Nepal',
  'Northern India',
  'Southern India',
  'Japan',
  'Vietnam',
  'Kyrgyzstan',
  'Bhutan',
  'Sri Lanka',
  'China'
];

const trekNames = {
  'Nepal': [
    'Everest Base Camp Trek',
    'Annapurna Circuit',
    'Langtang Valley Trek',
    'Ghorepani Poon Hill Trek',
    'Manaslu Circuit Trek'
  ],
  'Northern India': [
    'Valley of Flowers Trek',
    'Roopkund Trek',
    'Hampta Pass Trek',
    'Kedarkantha Trek',
    'Great Himalayan Trek'
  ],
  'Southern India': [
    'Kodachadri Trek',
    'Kudremukh Trek',
    'Nandi Hills Trek',
    'Mullayanagiri Trek',
    'Kumara Parvatha Trek'
  ],
  'Japan': [
    'Mount Fuji Trek',
    'Kumano Kodo Trail',
    'Nakasendo Trail',
    'Shikoku Pilgrimage',
    'Yakushima Island Trek'
  ],
  'Vietnam': [
    'Sapa Rice Terraces Trek',
    'Fansipan Mountain Trek',
    'Cat Ba Island Trek',
    'Mai Chau Valley Trek',
    'Ba Be National Park Trek'
  ],
  'Kyrgyzstan': [
    'Song-Kul Lake Trek',
    'Ala-Archa National Park',
    'Jeti-Oguz Canyon Trek',
    'Karakol Valley Trek',
    'Tian Shan Mountains Trek'
  ],
  'Bhutan': [
    'Snowman Trek',
    'Jomolhari Trek',
    'Druk Path Trek',
    'Bumthang Cultural Trek',
    'Gangtey Valley Trek'
  ],
  'Sri Lanka': [
    'Ella Rock Trek',
    'Adam\'s Peak Trek',
    'Knuckles Mountain Range',
    'Horton Plains Trek',
    'Sigiriya Rock Trek'
  ],
  'China': [
    'Great Wall Trek',
    'Yellow Mountain Trek',
    'Zhangjiajie Trek',
    'Tiger Leaping Gorge',
    'Mount Kailash Trek'
  ]
};

const descriptions = [
  'Experience breathtaking mountain views and ancient trails in this unforgettable adventure.',
  'Journey through pristine landscapes and discover hidden gems on this spectacular trek.',
  'Challenge yourself with steep ascents and rewarding panoramas on this epic expedition.',
  'Explore remote wilderness and immerse yourself in local culture on this unique trek.',
  'Traverse diverse terrain from lush valleys to snow-capped peaks on this amazing journey.'
];

const difficulties = ['Easy', 'Moderate', 'Difficult'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTrek(region, index) {
  const names = trekNames[region] || [];
  const name = names[index % names.length] || `${region} Adventure Trek ${index + 1}`;
  const difficulty = getRandomItem(difficulties);
  const duration = getRandomInt(4, 14);
  const availableSlots = getRandomInt(5, 20);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + getRandomInt(30, 180));
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration);
  
  return {
    name,
    location: region,
    difficulty,
    duration,
    availableSlots,
    startDate,
    endDate,
    region,
    price: getRandomInt(200, 2500),
    avgTime: `${getRandomInt(5, 8)} h ${getRandomInt(10, 50)}m`,
    avgDistance: `${(Math.random() * 10 + 8).toFixed(1)} km`,
    avgGain: `+${getRandomInt(500, 1200)} m`,
    avgLoss: `-${getRandomInt(400, 1100)} m`,
    description: getRandomItem(descriptions),
    imageUrl: `/static/uploads/${getRandomItem(trekImagesByRegion[region] || trekImagesByRegion.Nepal)}`,
    status: 'Approved'
  };
}

async function seedTreks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trekking');
    console.log('Connected to MongoDB');

    // Clear existing treks
    await Trek.deleteMany({});
    console.log('Cleared existing treks');

    // Generate 40 treks
    const treks = [];
    let trekIndex = 0;

    for (const region of regions) {
      const treksPerRegion = Math.floor(40 / regions.length);
      for (let i = 0; i < treksPerRegion; i++) {
        treks.push(generateTrek(region, trekIndex++));
      }
    }

    // Add remaining treks to reach 40
    while (treks.length < 40) {
      const region = getRandomItem(regions);
      treks.push(generateTrek(region, trekIndex++));
    }

    await Trek.insertMany(treks);
    console.log(`Successfully seeded ${treks.length} treks`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding treks:', error);
    process.exit(1);
  }
}

seedTreks();
