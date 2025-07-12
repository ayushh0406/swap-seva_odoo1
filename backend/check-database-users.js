import mongoose from 'mongoose';
import User from './models/User.js';
import Match from './models/Match.js';
import Chat from './models/Chat.js';
import Conversation from './models/Conversation.js';

// Connect to your MongoDB Atlas database
mongoose.connect('mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/Swap_sewa1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("✅ Connected to MongoDB Atlas");
  
  try {
    // Get all users
    const users = await User.find({});
    console.log(`\n📊 Total users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log("❌ No users found in the database");
    } else {
      console.log("\n👥 Sample users (first 5):");
      users.slice(0, 5).forEach((user, index) => {
        console.log(`\n--- User ${index + 1} ---`);
        console.log("ID:", user._id);
        console.log("Name:", user.name);
        console.log("Email:", user.email);
        console.log("Role:", user.role || "NOT SET");
        console.log("Created:", user.createdAt);
        console.log("Is Banned:", user.isBanned || false);
        console.log("All fields:", Object.keys(user.toObject()));
      });
    }
    
    // Check for admin users specifically
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\n👑 Admin users found: ${adminUsers.length}`);
    
    // Check for users without role field
    const usersWithoutRole = await User.find({ role: { $exists: false } });
    console.log(`\n❓ Users without role field: ${usersWithoutRole.length}`);
    
    // Check for banned users
    const bannedUsers = await User.find({ isBanned: true });
    console.log(`\n🚫 Banned users: ${bannedUsers.length}`);

    // --- MATCHES DEBUG ---
    const matches = await Match.find({});
    console.log(`\n🔗 Total matches found: ${matches.length}`);
    if (matches.length === 0) {
      console.log("❌ No matches found in the database");
    } else {
      console.log("\n🔍 Sample matches (first 5):");
      matches.slice(0, 5).forEach((match, idx) => {
        console.log(`\n--- Match ${idx + 1} ---`);
        console.log("ID:", match._id);
        console.log("Status:", match.status);
        console.log("Users:", match.users);
        console.log("Barter Type:", match.barterType);
        console.log("Created:", match.createdAt);
        console.log("All fields:", Object.keys(match.toObject()));
      });
      // Print status counts
      const statusCounts = await Match.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);
      console.log("\n📊 Match status counts:", statusCounts);
    }

    // --- CHATS DEBUG ---
    const chats = await Chat.find({});
    console.log(`\n💬 Total chats found: ${chats.length}`);
    if (chats.length === 0) {
      console.log("❌ No chats found in the database");
    } else {
      console.log("\n💬 Sample chats (first 5):");
      chats.slice(0, 5).forEach((chat, idx) => {
        console.log(`\n--- Chat ${idx + 1} ---`);
        console.log("ID:", chat._id);
        console.log("Participants:", chat.participants);
        console.log("Trade Info:", chat.tradeInfo ? "Present" : "Not present");
        if (chat.tradeInfo) {
          console.log("Trade Status:", chat.tradeInfo.status);
          console.log("Initiator Offering:", chat.tradeInfo.initiatorOffering ? "Present" : "Not present");
          console.log("Responder Offering:", chat.tradeInfo.responderOffering ? "Present" : "Not present");
        }
        console.log("Messages Count:", chat.messages ? chat.messages.length : 0);
        console.log("Created:", chat.createdAt);
        console.log("All fields:", Object.keys(chat.toObject()));
      });
    }

    // --- CONVERSATIONS DEBUG ---
    const conversations = await Conversation.find({});
    console.log(`\n🗣️ Total conversations found: ${conversations.length}`);
    if (conversations.length === 0) {
      console.log("❌ No conversations found in the database");
    } else {
      console.log("\n🗣️ Sample conversations (first 5):");
      conversations.slice(0, 5).forEach((conv, idx) => {
        console.log(`\n--- Conversation ${idx + 1} ---`);
        console.log("ID:", conv._id);
        console.log("Participants:", conv.participants);
        console.log("Match Reference:", conv.match ? "Present" : "Not present");
        console.log("Is Active:", conv.isActive);
        console.log("Created:", conv.createdAt);
        console.log("All fields:", Object.keys(conv.toObject()));
      });
    }

    // --- CHECK ALL COLLECTIONS IN DATABASE ---
    console.log("\n🔍 Checking all collections in database...");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📋 All collections found:");
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

  } catch (error) {
    console.error("❌ Error fetching data:", error);
  } finally {
    mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
})
.catch((error) => {
  console.error("❌ MongoDB connection error:", error);
}); 