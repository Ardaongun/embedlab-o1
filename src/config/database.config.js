import { MongoClient } from 'mongodb';
import { CONFIGS } from './config.js';


let clientInstance = null;

export const connectDB = async () => {
    try {
        clientInstance = await MongoClient.connect(CONFIGS.DB_URI);
        console.log('MongoDB connected...');

        process.on('exit', () => {
            console.log('Closing MongoDB connection...');
            clientInstance.close();
        });
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

export const getDb = () => (clientInstance ? clientInstance.db() : null);