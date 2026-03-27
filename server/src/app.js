const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/scan', require('./routes/scan'));

module.exports = app;
