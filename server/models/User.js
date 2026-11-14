const mongoose = require('mongoose');
const { isUsingFallback, memoryStore } = require('../config/db');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['analyst', 'admin', 'auditor'], default: 'analyst' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

class UserModel {
  static async findOne(query) {
    if (!isUsingFallback()) {
      return await MongooseUser.findOne(query);
    }
    return memoryStore.users.find(u => {
      for (const key in query) {
        if (query[key] instanceof RegExp) {
          if (!query[key].test(u[key])) return false;
        } else if (u[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  }

  static async findById(id) {
    if (!isUsingFallback()) {
      return await MongooseUser.findById(id);
    }
    return memoryStore.users.find(u => (u._id || u.id) === id) || null;
  }

  static async create(data) {
    if (!isUsingFallback()) {
      return await MongooseUser.create(data);
    }
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...data,
      createdAt: new Date()
    };
    memoryStore.users.push(newUser);
    return newUser;
  }

  static async countDocuments() {
    if (!isUsingFallback()) {
      return await MongooseUser.countDocuments();
    }
    return memoryStore.users.length;
  }

  static async deleteMany() {
    if (!isUsingFallback()) {
      return await MongooseUser.deleteMany({});
    }
    memoryStore.users = [];
    return { deletedCount: memoryStore.users.length };
  }
}

module.exports = UserModel;
