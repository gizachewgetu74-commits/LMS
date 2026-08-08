const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing with EXACT Compass connection string...');
    console.log('📝 URI:', process.env.MONGODB_URI.replace(/\/\/[^@]+@/, '//****:****@'));
    
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
        });
        
        console.log('✅ Connected successfully!');
        console.log('📊 Database:', conn.connection.db.databaseName);
        console.log('🔗 Host:', conn.connection.host);
        console.log('✅ Connection ready!');
        
        // List collections to verify access
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('📚 Collections:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'No collections yet');
        
        await mongoose.connection.close();
        console.log('✅ Connection closed');
        return true;
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error('Error:', error.message);
        console.error('Full error:', error);
        return false;
    }
}

testConnection();