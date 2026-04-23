const express = require('express');
const cors = require('cors');
const { MAX_VT_UPLOAD_BYTES } = require('./constants/vtUploadAllowlist');

const app = express();
app.use(cors());
// Base64 in JSON is ~4/3 of file size; allow headroom for field names and data URL prefix.
const jsonLimitMb = Math.ceil((MAX_VT_UPLOAD_BYTES * 4) / 3 / (1024 * 1024)) + 5;
app.use(express.json({ limit: `${jsonLimitMb}mb` }));

app.use('/api/scan', require('./routes/scan'));
app.use('/api/logs', require('./routes/logs'));

module.exports = app;
