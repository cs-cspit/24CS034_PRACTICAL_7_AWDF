require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");

// Middleware
app.use(express.json());
app.use(logger);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed");
    });

// Routes
app.use("/tasks", taskRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
