const mongoose = require('mongoose');
const { isUsingFallback, memoryStore } = require('../config/db');

const alertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true, index: true },
  attackType: { type: String, required: true, index: true },
  ruleId: { type: String, required: true },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true, index: true },
  timestamp: { type: Date, required: true },
  sourceIP: { type: String, required: true, index: true },
  destinationIP: { type: String, required: true },
  protocol: { type: String, required: true },
  port: { type: Number, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  stateTrace: [{ type: String }],
  matchedEventsCount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Investigating', 'Resolved', 'Dismissed'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseAlert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);

class AlertQueryHelper {
  constructor(data) {
    this.data = data;
    this._skip = 0;
    this._limit = null;
    this._sort = null;
  }

  sort(sortOptions) {
    this._sort = sortOptions;
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  async exec() {
    let result = [...this.data];

    if (this._sort) {
      const keys = Object.keys(this._sort);
      result.sort((a, b) => {
        for (const k of keys) {
          const dir = this._sort[k];
          let valA = a[k];
          let valB = b[k];
          if (k === 'timestamp' || k === 'createdAt') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          }
          if (valA < valB) return dir > 0 ? -1 : 1;
          if (valA > valB) return dir > 0 ? 1 : -1;
        }
        return 0;
      });
    }

    if (this._skip) {
      result = result.slice(this._skip);
    }
    if (this._limit !== null && this._limit !== undefined) {
      result = result.slice(0, this._limit);
    }

    return result;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

class AlertModel {
  static filterArray(arr, query = {}) {
    return arr.filter(item => {
      for (const key of Object.keys(query)) {
        const val = query[key];
        if (val === undefined) continue;

        if (key === '$or' && Array.isArray(val)) {
          const matchOr = val.some(subQuery => {
            return Object.keys(subQuery).every(subKey => {
              const subVal = subQuery[subKey];
              if (subVal instanceof RegExp) {
                return subVal.test(item[subKey] || '');
              }
              return item[subKey] === subVal;
            });
          });
          if (!matchOr) return false;
          continue;
        }

        if (val instanceof RegExp) {
          if (!val.test(item[key] || '')) return false;
        } else if (typeof val === 'object' && val !== null) {
          if (val.$gte && new Date(item[key]) < new Date(val.$gte)) return false;
          if (val.$lte && new Date(item[key]) > new Date(val.$lte)) return false;
          if (val.$in && !val.$in.includes(item[key])) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });
  }

  static find(query = {}) {
    if (!isUsingFallback()) {
      return MongooseAlert.find(query);
    }
    const filtered = this.filterArray(memoryStore.alerts, query);
    return new AlertQueryHelper(filtered);
  }

  static async findById(id) {
    if (!isUsingFallback()) {
      return await MongooseAlert.findById(id);
    }
    return memoryStore.alerts.find(a => (a._id || a.id) === id || a.alertId === id) || null;
  }

  static async findOne(query) {
    if (!isUsingFallback()) {
      return await MongooseAlert.findOne(query);
    }
    const filtered = this.filterArray(memoryStore.alerts, query);
    return filtered.length > 0 ? filtered[0] : null;
  }

  static async create(data) {
    if (!isUsingFallback()) {
      return await MongooseAlert.create(data);
    }
    const doc = {
      _id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...data,
      createdAt: new Date()
    };
    memoryStore.alerts.push(doc);
    return doc;
  }

  static async insertMany(docs) {
    if (!isUsingFallback()) {
      return await MongooseAlert.insertMany(docs);
    }
    const inserted = docs.map((d, index) => ({
      _id: `alt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
      id: `alt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
      ...d,
      createdAt: new Date()
    }));
    memoryStore.alerts.push(...inserted);
    return inserted;
  }

  static async findByIdAndDelete(id) {
    if (!isUsingFallback()) {
      return await MongooseAlert.findByIdAndDelete(id);
    }
    const index = memoryStore.alerts.findIndex(a => (a._id || a.id) === id || a.alertId === id);
    if (index !== -1) {
      const removed = memoryStore.alerts.splice(index, 1);
      return removed[0];
    }
    return null;
  }

  static async countDocuments(query = {}) {
    if (!isUsingFallback()) {
      return await MongooseAlert.countDocuments(query);
    }
    return this.filterArray(memoryStore.alerts, query).length;
  }

  static async deleteMany(query = {}) {
    if (!isUsingFallback()) {
      return await MongooseAlert.deleteMany(query);
    }
    if (Object.keys(query).length === 0) {
      const count = memoryStore.alerts.length;
      memoryStore.alerts = [];
      return { deletedCount: count };
    }
    const initial = memoryStore.alerts.length;
    memoryStore.alerts = memoryStore.alerts.filter(a => !this.filterArray([a], query).length);
    return { deletedCount: initial - memoryStore.alerts.length };
  }
}

module.exports = AlertModel;
