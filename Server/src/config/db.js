const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'library_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promisify for async/await usage
const promisePool = pool.promise();

// Test connection
const connectDB = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ MySQL Connected successfully!');
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        connection.release();
        return promisePool;
    } catch (error) {
        console.error('❌ MySQL Connection Error:', error.message);
        console.error('💡 Please check:');
        console.error('   1. XAMPP MySQL is running');
        console.error('   2. Database name is correct');
        console.error('   3. Username/password are correct');
        process.exit(1);
    }
};

module.exports = { connectDB, promisePool };