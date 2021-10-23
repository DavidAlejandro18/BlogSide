// @ts-check
const mongoose = require('mongoose');

const dbConnection = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_CNN);

        console.log('Database is connected');
    } catch (error) {
        console.log(error);
        throw new Error('Database connection failed');
    }
}

module.exports = dbConnection;