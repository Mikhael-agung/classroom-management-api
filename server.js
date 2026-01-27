require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

// Import routes
const apiRoutes = require("./routes/api");

// Import seeding function - FIX IMPORT
let seedDatabase;
try {
  // Coba import sebagai module
  const seedModule = require("./data/seedData");
  seedDatabase = seedModule.seedDatabase || seedModule.default;
} catch (error) {
  console.error("Error loading seed module:", error.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/university_db")
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// API Routes
app.use("/api", apiRoutes);

// Health check
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusText = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: statusText[dbStatus] || "unknown",
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "University Management System API",
    version: "2.0.0",
    documentation: "/api",
    health: "/health",
    seeding: {
      manual: "POST /api/data/seed",
      status: "GET /api/data/seed/status",
      cli: "npm run seed",
    },
  });
});

// Manual seeding command
if (process.argv.includes("--seed")) {
  console.log("🌱 Running database seeding via command line...");

  if (!seedDatabase || typeof seedDatabase !== "function") {
    console.error("❌ ERROR: seedDatabase function not found or not a function");
    console.error("   Checking seedData.js export...");

    // Coba require langsung
    try {
      const seedModule = require("./data/seedData");
      console.log("   Module loaded:", Object.keys(seedModule));

      if (seedModule.seedDatabase && typeof seedModule.seedDatabase === "function") {
        seedDatabase = seedModule.seedDatabase;
        console.log("   Found seedDatabase function");
      } else if (typeof seedModule === "function") {
        seedDatabase = seedModule;
        console.log("   Module itself is a function");
      } else {
        console.error("   No valid seed function found");
        process.exit(1);
      }
    } catch (error) {
      console.error("   Error requiring seedData:", error.message);
      process.exit(1);
    }
  }

  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server only if not in seeding mode
if (!process.argv.includes("--seed")) {
  app.listen(PORT, () => {
    console.log("========================================");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("========================================");
    console.log("📚 API Documentation:");
    console.log(`   📍 Local: http://localhost:${PORT}/api`);
    console.log("========================================");
  });
}
