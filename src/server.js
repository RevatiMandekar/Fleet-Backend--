import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import { setupSocketHandlers } from "./socket/socketHandlers.js";
import { startAlertScheduler } from "./services/alertService.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Make io available globally for use in routes
app.set('io', io);

// Start alert scheduler for maintenance and overdue trip checks
startAlertScheduler();

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO server ready for real-time connections`);
  console.log(`🕐 Alert scheduler started for maintenance and overdue trip monitoring`);
});