import mongoose from 'mongoose';
import { Trek } from './src/models.js';
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

const images = {
  'Nepal': [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&h=600&fit=crop'
  ],
  'Northern India': [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598012448163-355938011492?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop'
  ],
  'Southern India': [
    'https://images.unsplash.com/photo-1580746738089-0c9b1f89670e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0189?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&h=600&fit=crop'
  ],
  'Japan': [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&h=600&fit=crop'
  ],
  'Vietnam': [
    'https://images.unsplash.com/photo-1506157786151-b8491531f436?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1538970272646-f61fabb3a8a2?w=800&h=600&fit=crop'
  ],
  'Kyrgyzstan': [
    'https://images.unsplash.com/photo-1518182170546-0766a3e14d16?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  ],
  'Bhutan': [
    'https://images.unsplash.com/photo-1565539978016-8c1ab9e83231?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop'
  ],
  'Sri Lanka': [
    'https://images.unsplash.com/photo-1598012448163-355938011492?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop'
  ],
  'China': [
    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&h=600&fit=crop'
  ]
};

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
    imageFilename: getRandomItem(images[region] || images['Nepal']),
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
