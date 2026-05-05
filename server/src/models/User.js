const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
