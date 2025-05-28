import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Set JWT_SECRET for any mongoose operations that might need it
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "mumbai_swap_dev_secret_key_2024";
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/Swap_sewa?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("✅ Connected to MongoDB");
  
  try {
    // Drop the problematic index on users collection
    await mongoose.connection.db.collection('users').dropIndex('phone_1');
    console.log("Successfully dropped phone_1 index");
  } catch (error) {
    console.log("No phone_1 index to drop or error:", error.message);
  }
  
  console.log("Database indexes fixed. You can now run the server normally.");
  process.exit(0);
})
.catch((error) => {
  console.error("❌ MongoDB connection error:", error);
  process.exit(1);
}); 