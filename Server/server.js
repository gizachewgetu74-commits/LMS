const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB, promisePool } = require("./src/config/db");

// Import routes - CORRECT PATH
const studentRoutes = require("./src/routes/studentRoutes");

dotenv.config();

const startServer = async () => {
    try {
        // Connect to MySQL
        await connectDB();

        const app = express();

        // Middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors({
            origin: "http://localhost:5173",
            credentials: true
        }));

        // Test route
        app.get("/", async (req, res) => {
            try {
                const [rows] = await promisePool.query('SELECT 1 as connected');
                res.json({
                    message: "Server is running!",
                    database: "Connected to MySQL",
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Use student routes
        app.use("/api/students", studentRoutes);

        // Example API route: Get all books (if you have books table)
        app.get("/api/books", async (req, res) => {
            try {
                const [rows] = await promisePool.query('SELECT * FROM books');
                res.json(rows);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 http://localhost:${PORT}/`);
            console.log(`📚 Student API: http://localhost:${PORT}/api/students`);
        });

    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();