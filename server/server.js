import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { 
        origin: "*", 
        methods: ["GET", "POST"] 
    }
});

// 1. Paste your MongoDB connection string inside these quotes below:
const MONGO_URI = "mongodb://Calli-Chat:Callitus12345@ac-bv4iqz7-shard-00-00.apgi5ma.mongodb.net:27017,ac-bv4iqz7-shard-00-01.apgi5ma.mongodb.net:27017,ac-bv4iqz7-shard-00-02.apgi5ma.mongodb.net:27017/?ssl=true&replicaSet=atlas-z20bqa-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to Cloud Database!"))
  .catch((err) => console.log("Database connection error:", err));
  // Map to monitor real-time connected user socket sessions
const onlineUsers = new Map();

// 2. Message data structure
const MessageSchema = new mongoose.Schema({
    room: String,
    author: String,
    message: String,
    time: String,
    timestamp: { type: Date, default: Date.now }
});
const MessageModel = mongoose.model("messages", MessageSchema);
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  contacts: [String] // Array to hold usernames of added friends
});
const UserModel = mongoose.model("users", UserSchema);
const ChatSchema = new mongoose.Schema({
  participants: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});
const ChatModel = mongoose.model("chats", ChatSchema);

app.use(express.json());

app.post('/add-contact', async  (req, res) => {
  try {
    const { username, contactName } = req.body;
    
    // Find the user and push the new contact into their contacts array
    const updatedUser = await UserModel.findOneAndUpdate(
      { username: username.toLowerCase().trim() },
      { $addToSet: { contacts: contactName.toLowerCase().trim() } }, // $addToSet prevents duplicates
      { new: true }
    );
    // --- Paste this right below your /add-contact route ---
app.post('/api/ai/smart-replies', (req, res) => {
  try {
    const { conversationHistory } = req.body;
    
    const lastMessage = conversationHistory && conversationHistory.length > 0 
      ? conversationHistory[conversationHistory.length - 1].toLowerCase() 
      : "";

    let mockReplies = ["Cool!", "Sounds good", "Awesome!"]; 

    if (lastMessage.includes("hello") || lastMessage.includes("hi")) {
      mockReplies = ["Hey there!", "Hello!", "How's it going?"];
    } else if (lastMessage.includes("bye") || lastMessage.includes("love")) {
      mockReplies = ["Bye!", "Talk to you later", "Take care ❤️"];
    } else if (lastMessage.includes("where")) {
      mockReplies = ["On my way!", "At home", "Not sure yet"];
    } else if (lastMessage.includes("how are you")) {
      mockReplies = ["Doing well!", "Good, you?", "Pretty busy"];
    }

    res.json({ replies: mockReplies });
  } catch (error) {
    console.error("Mock Server Error:", error);
    res.status(500).json({ error: "Failed to load suggestions" });
  }
});

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, contacts: updatedUser.contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
socket.on("login_user", async (username, callback) => {
    // FORCE BOTH NAMES TO LOWERCASE AND REMOVE SPACES
    const cleanUsername = username.toLowerCase().trim();

    // 1. Add user to online tracker map and broadcast update live
    onlineUsers.set(cleanUsername, socket.id);
    io.emit("update_online_users", Array.from(onlineUsers.keys()));

    let user = await UserModel.findOne({ username: cleanUsername });
    if (!user) {
      user = new UserModel({ username: cleanUsername, contacts: [] });
      await user.save();
    }

    socket.join(cleanUsername);
    callback({ userId: user._id.toString() });
   


  socket.on("meta_ai_query", async (data) => {
    try {
        const userQuery = data.query;
        const aiReply = await getGroqAIResponse(userQuery);
        socket.emit("meta_ai_response", { reply: aiReply });
    } catch (error) {
        console.error("Socket AI Error:", error);
        socket.emit("meta_ai_response", { reply: "Error processing your request." });
    }
});

    // 2. Clear user out automatically when they close their tab or disconnect
    socket.on("disconnect", () => {
      onlineUsers.delete(cleanUsername);
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
    });
  });
 // Handle adding an emoji reaction globally
  socket.on('send_reaction', (reactionData) => {
    // Broadcast directly to everyone online
    io.emit('receive_reaction', {
      messageId: reactionData.messageId,
      reactorName: reactionData.reactorName,
      emoji: reactionData.emoji
    });
  });
  socket.on('mark_as_read', ({ chatId }) => {
      io.to(chatId).emit('messages_updated_status', {
          chatId: chatId,
          status: 'read'
      });
  });

 socket.on("access_chat", async ({ currentUsername, targetUsername }) => {
    try {
        // 💡 FORCE BOTH NAMES TO LOWERCASE
        const cleanCurrent = currentUsername.toLowerCase().trim();
        const cleanTarget = targetUsername.toLowerCase().trim();

        let chat = await ChatModel.findOne({
            participants: { $all: [cleanCurrent, cleanTarget] }
        });

        if (!chat) {
            chat = new ChatModel({ participants: [cleanCurrent, cleanTarget] });
            await chat.save();
        }

        const roomId = chat._id.toString();
        socket.join(roomId);
        
        // Ensure you emit the room ID back to the client here if needed
            // Fetch history bound to this unique Chat ID
            const history = await MessageModel.find({ room: roomId }).sort({ timestamp: 1 });

            // Send the room ID and past history logs back to the user
            socket.emit("chat_initialized", { roomId, history });
        } catch (err) {
            console.error("Global chat error:", err);
        }
    });
socket.on("send_message", async (data) => {
        try {
            const newMessage = new MessageModel(data);
            await newMessage.save(); // Saves text to cloud database globally

            // Broadcast message instantly to everyone active in this unique room channel
            socket.to(data.room).emit("receive_message", data);
        } catch (err) {
            console.error("Error sending global message:", err);
        }
    });
    socket.on("typing", (data) => {
        socket.to(data.room).emit("user_typing", data);
    });

    socket.on("stop_typing", (data) => {
        socket.to(data.room).emit("user_stop_typing", data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
app.post('/api/ai/smart-replies', (req, res) => {
  try {
    const { conversationHistory } = req.body;
    
    const lastMessage = conversationHistory && conversationHistory.length > 0 
      ? conversationHistory[conversationHistory.length - 1].toLowerCase() 
      : "";

    let mockReplies = ["Cool!", "Sounds good", "Awesome!"]; 

    if (lastMessage.includes("hello") || lastMessage.includes("hi")) {
      mockReplies = ["Hey there!", "Hello!", "How's it going?"];
    } else if (lastMessage.includes("bye") || lastMessage.includes("love")) {
      mockReplies = ["Bye!", "Talk to you later", "Take care ❤️"];
    } else if (lastMessage.includes("where")) {
      mockReplies = ["On my way!", "At home", "Not sure yet"];
    } else if (lastMessage.includes("how are you")) {
      mockReplies = ["Doing well!", "Good, you?", "Pretty busy"];
    }

    res.json({ replies: mockReplies });
  } catch (error) {
    console.error("Mock Server Error:", error);
    res.status(500).json({ error: "Failed to load suggestions" });
  }
});

const PORT = process.env.PORT || 4500;

httpServer.listen(PORT, () => {
    console.log(`Server running perfectly on port ${PORT}`);
});

// Function to handle Groq AI logic safely
async function getGroqAIResponse(userQuery) {
  try {
    // This connects directly to the real Llama 3 AI model!
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: userQuery }],
      model: "llama3-8b-8192",
    });
   return chatCompletion?.choices?.[0]?.message?.content || "No response text received.";
  } catch (error) {
    console.error("Groq API Error:", error);
    return "Sorry, I had trouble processing that question.";
  }
}
