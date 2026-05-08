const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startMailInboxWorker } = require('./mailInboxWorker');

dotenv.config();
const app = require('./app');

// connect to DB only when not testing
if (process.env.NODE_ENV !== 'test') {
	connectDB();
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
		
		const hasGmailUser = process.env.GMAIL_USER || process.env.GMAIL_INBOX_USER;
		const hasGmailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_INBOX_APP_PASSWORD;
		if (hasGmailUser && hasGmailPass) {
			startMailInboxWorker();
		} else {
			console.log('[mail-inbox] skipping worker: GMAIL_USER or GMAIL_APP_PASSWORD not set');
		}
	});
}

module.exports = app;
