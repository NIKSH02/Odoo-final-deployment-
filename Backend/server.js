import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { scheduleBookingCleanup } from "./utils/bookingCleanup.js";
import ApiError from "./utils/ApiError.js";
import ApiResponse from './utils/ApiResponse.js';
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import venueRoutes from "./routes/venue.js";
import courtRoutes from "./routes/court.js";
import bookingRoutes from "./routes/booking.js";
import reviewRoutes from "./routes/review.js";
import dashboardRoutes from "./routes/dashboard.js";
import searchRoutes from "./routes/search.js";
import adminRoutes from "./routes/admin.js";
import locationRoutes from "./routes/location.js";
import mapRoutes from "./routes/map.js";
import paymentRoutes from "./routes/payment.js";
import cookieParser from "cookie-parser";
import path from "path";
import {Server as socketIo} from 'socket.io'
import { createServer } from 'http'
import groupchatroute from './routes/groupChat.route.js'
import locationChatSocket from './locationChatSocket.js'

// Load environment variables
dotenv.config();
// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;

connectDB();

const httpServer = createServer(app);

// server defining 
const io = new socketIo(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174", // add any other frontend URLs you use
    ],
    credentials: true, // if you use cookies/sessions
    transports: ["websocket", "polling"],
  })
);

app.use(cookieParser());

// Helper: Log static file serving for debug
console.log("Serving static files from:", path.resolve("uploads"));
app.use("/uploads", express.static("uploads"));

// Add debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/location", locationRoutes);
app.use('/api/messages', groupchatroute);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RawConnect Chat Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Socket.io connection handling
const socketHandler = locationChatSocket(io);
app.use("/api/map", mapRoutes);
app.use("/api/payments", paymentRoutes);

// 404 Route Not Found handler
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }

    console.log("HTTP server closed");

    // Close database connection
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");

      // Cleanup socket connections
      if (socketHandler && socketHandler.cleanup) {
        socketHandler.cleanup();
        console.log("Socket connections cleaned up");
      }

      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err); // Add this line for debugging
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];
  
  res.status(statusCode).json(new ApiResponse(statusCode, null, message));
});
// Start Server
httpServer.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  
  // Start booking cleanup scheduler
  scheduleBookingCleanup();
});

export default app;
