'use strict';

require('dotenv').config();
const { startMailInboxWorker } = require('./mailInboxWorker');

startMailInboxWorker();
