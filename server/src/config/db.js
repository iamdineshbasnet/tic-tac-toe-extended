const { mongoose } = require('mongoose');

// connect to the database
const connectDB = async () => {
	mongoose
		.connect(process.env.MONGO_URI, {
			serverSelectionTimeoutMS: 8000,
		})
		.then(() => {
			console.log('Successfully connected to the db!');
		})
		.catch((err) => {
			console.log('failed to connect with db', err);
		});
};

module.exports = connectDB