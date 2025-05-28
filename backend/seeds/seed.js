import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Interest from '../models/Interest.js';
import bcrypt from 'bcrypt';

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/Swap_sewa?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB for seeding"))
.catch((error) => {
  console.error("❌ MongoDB connection error:", error);
  process.exit(1);
});

// Sample skills data
const skillsData = [
  { 
    name: 'Chess', 
    description: 'Strategic board game played on a checkered gameboard.', 
    category: 'sports',
    image: '/images/skills/chess.jpg',
    status: 'active'
  },
  { 
    name: 'Carrom', 
    description: 'Tabletop game of Indian origin using striker disk and carrom men.', 
    category: 'sports',
    image: '/images/skills/carrom.jpg',
    status: 'active'
  },
  { 
    name: 'Guitar', 
    description: 'Stringed musical instrument played with fingers or a pick.', 
    category: 'music',
    image: '/images/skills/guitar.jpg',
    status: 'active'
  },
  { 
    name: 'Piano', 
    description: 'Musical instrument played by pressing keys that cause hammers to strike strings.', 
    category: 'music',
    image: '/images/skills/piano.jpg',
    status: 'active'
  },
  { 
    name: 'JavaScript', 
    description: 'Programming language for web development.', 
    category: 'tech',
    image: '/images/skills/javascript.jpg',
    status: 'active'
  },
  { 
    name: 'Yoga', 
    description: 'Physical, mental, and spiritual practice originating in ancient India.', 
    category: 'sports',
    image: '/images/skills/yoga.jpg',
    status: 'active'
  },
  { 
    name: 'Spanish Language', 
    description: 'Romance language with hundreds of millions of native speakers.', 
    category: 'language',
    image: '/images/skills/spanish.jpg',
    status: 'active'
  },
  { 
    name: 'French Cooking', 
    description: 'Culinary techniques and dishes originating from France.', 
    category: 'cooking',
    image: '/images/skills/french-cooking.jpg',
    status: 'active'
  }
];

// Sample interests data
const interestsData = [
  { 
    name: 'Photography', 
    description: 'The art of capturing light with a camera.', 
    category: 'art',
    image: '/images/interests/photography.jpg',
    status: 'active'
  },
  { 
    name: 'Hiking', 
    description: 'Walking for long distances, especially across country or in the woods.', 
    category: 'sports',
    image: '/images/interests/hiking.jpg',
    status: 'active'
  },
  { 
    name: 'Reading', 
    description: 'The activity of looking at and understanding written words.', 
    category: 'education',
    image: '/images/interests/reading.jpg',
    status: 'active'
  },
  { 
    name: 'Cooking', 
    description: 'The practice of preparing food by combining, mixing, and heating ingredients.', 
    category: 'lifestyle',
    image: '/images/interests/cooking.jpg',
    status: 'active'
  },
  { 
    name: 'Travel', 
    description: 'Going from one place to another, as on a trip or journey.', 
    category: 'lifestyle',
    image: '/images/interests/travel.jpg',
    status: 'active'
  },
  { 
    name: 'Gaming', 
    description: 'Playing video games on a console, computer, or mobile device.', 
    category: 'technology',
    image: '/images/interests/gaming.jpg',
    status: 'active'
  }
];

// Sample users data
const usersData = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123',
    phone: '9876543210',
    avatar: '/images/users/rahul.jpg',
    bio: 'Chess enthusiast looking to learn playing guitar.',
    profession: 'Software Engineer',
    languages: ['English', 'Hindi'],
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760], // Mumbai coordinates
      address: 'Andheri, Mumbai'
    },
    offerings: [
      {
        type: 'skill',
        title: 'Chess Lessons',
        description: 'Can teach chess strategy for beginners to intermediate players.',
        category: 'sports',
        skillLevel: 'advanced'
      }
    ],
    needs: [
      {
        type: 'skill',
        title: 'Guitar Lessons',
        description: 'Looking for someone to teach me basic guitar.',
        category: 'music',
        urgency: 'medium'
      }
    ]
  },
  {
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'password123',
    phone: '9876543211',
    avatar: '/images/users/priya.jpg',
    bio: 'Music teacher who loves playing guitar and would like to learn chess.',
    profession: 'Music Teacher',
    languages: ['English', 'Gujarati'],
    location: {
      type: 'Point',
      coordinates: [72.8856, 19.1136], // Mumbai coordinates
      address: 'Borivali, Mumbai'
    },
    offerings: [
      {
        type: 'skill',
        title: 'Guitar Lessons',
        description: 'Can teach guitar to beginners.',
        category: 'music',
        skillLevel: 'expert'
      }
    ],
    needs: [
      {
        type: 'skill',
        title: 'Chess Lessons',
        description: 'Want to learn chess from scratch.',
        category: 'sports',
        urgency: 'low'
      }
    ]
  },
  {
    name: 'Amit Singh',
    email: 'amit@example.com',
    password: 'password123',
    phone: '9876543212',
    avatar: '/images/users/amit.jpg',
    bio: 'Tech enthusiast who loves coding and yoga.',
    profession: 'Web Developer',
    languages: ['English', 'Hindi', 'Punjabi'],
    location: {
      type: 'Point',
      coordinates: [72.8296, 19.0519], // Mumbai coordinates
      address: 'Bandra, Mumbai'
    },
    offerings: [
      {
        type: 'skill',
        title: 'JavaScript Tutoring',
        description: 'Can teach JavaScript programming.',
        category: 'tech',
        skillLevel: 'expert'
      },
      {
        type: 'good',
        title: 'Unused Laptop',
        description: 'Have a 2-year-old laptop I no longer use. Good condition.',
        category: 'electronics'
      }
    ],
    needs: [
      {
        type: 'skill',
        title: 'Yoga Instructor',
        description: 'Looking for a yoga teacher for beginners.',
        category: 'sports',
        urgency: 'medium'
      }
    ]
  }
];

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Interest.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Seed skills
    const skills = await Skill.insertMany(skillsData);
    console.log(`${skills.length} skills added`);
    
    // Seed interests
    const interests = await Interest.insertMany(interestsData);
    console.log(`${interests.length} interests added`);
    
    // Seed users (hash passwords manually since pre-save hook won't run with insertMany)
    for (const userData of usersData) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      await User.create({
        ...userData,
        password: hashedPassword,
        interests: [interests[Math.floor(Math.random() * interests.length)]._id],
        skills: [skills[Math.floor(Math.random() * skills.length)]._id]
      });
    }
    
    console.log(`${usersData.length} users added`);
    
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 