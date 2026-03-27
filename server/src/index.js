const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = require('./app');

// connect to DB only when not testing
if (process.env.NODE_ENV !== 'test') {
	connectDB();
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
