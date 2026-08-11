const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB, promisePool } = require("./src/config/db");

// Import routes
const studentRoutes = require("./src/routes/studentRoutes");
const bookRoutes = require("./src/routes/bookRoutes");

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

        // ============ API Routes ============
        

        // Student routes (CRUD operations)
        app.use("/api/students", studentRoutes);

        // Book routes (CRUD operations with search, filter, stats)
        app.use("/api/books", bookRoutes);

        // ============ API Endpoints Summary ============
        console.log("\n📚 API Endpoints:");
        console.log(`   🔐 Auth:     http://localhost:5000/api/auth`);
        console.log(`   👨‍🎓 Students: http://localhost:5000/api/students`);
        console.log(`   📖 Books:    http://localhost:5000/api/books`);

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📡 http://localhost:${PORT}/`);
            console.log(`\n✨ Ready for requests!`);
        });

    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();