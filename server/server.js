import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

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

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
  socket.on("login_user", async (username, callback) => {
    // 💡 FORCE TO LOWERCASE AND REMOVE SPACES
    const cleanUsername = username.toLowerCase().trim(); 

    let user = await UserModel.findOne({ username: cleanUsername });
    if (!user) {
        user = new UserModel({ username: cleanUsername, contacts: [] });
        await user.save();
    }
    socket.join(cleanUsername);
    callback({ userId: user._id.toString() });
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

const PORT = process.env.PORT || 4500;

httpServer.listen(PORT, () => {
    console.log(`Server running perfectly on port ${PORT}`);
});