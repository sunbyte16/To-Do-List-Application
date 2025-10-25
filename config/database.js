/**
 * Database Configuration
 * © 2k25 𝕊𝕦𝕟𝕚𝕝 𝕊𝕙𝕒𝕣𝕞𝕒. All rights reserved
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // MongoDB connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        };

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('✅ Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ Mongoose disconnected from MongoDB');
        });

        // Handle app termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        
        // Fallback to in-memory storage
        console.log('🔄 Falling back to in-memory storage...');
        return null;
    }
};

// Check if MongoDB is connected
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

// Get connection status
const getConnectionStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
    connectDB,
    isConnected,
    getConnectionStatus
};