const mongoose = require('mongoose');
const { isUsingFallback, memoryStore } = require('../config/db');

const eventSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  sourceIP: { type: String, required: true, index: true },
  destinationIP: { type: String, required: true, index: true },
  protocol: { type: String, required: true, index: true },
  port: { type: Number, required: true },
  action: { type: String, required: true },
  status: { type: String, enum: ['SAFE', 'SUSPICIOUS'], default: 'SAFE', index: true },
  fsmState: { type: String, default: 'START' },
  matchedRule: { type: String, default: null },
  alertTriggered: { type: String, default: null },
  batchId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const MongooseEvent = mongoose.models.NetworkEvent || mongoose.model('NetworkEvent', eventSchema);

class EventQueryHelper {
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

class NetworkEventModel {
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
      return MongooseEvent.find(query);
    }
    const filtered = this.filterArray(memoryStore.events, query);
    return new EventQueryHelper(filtered);
  }

  static async findById(id) {
    if (!isUsingFallback()) {
      return await MongooseEvent.findById(id);
    }
    return memoryStore.events.find(e => (e._id || e.id) === id) || null;
  }

  static async create(data) {
    if (!isUsingFallback()) {
      return await MongooseEvent.create(data);
    }
    const doc = {
      _id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...data,
      createdAt: new Date()
    };
    memoryStore.events.push(doc);
    return doc;
  }

  static async insertMany(docs) {
    if (!isUsingFallback()) {
      return await MongooseEvent.insertMany(docs);
    }
    const inserted = docs.map((d, index) => ({
      _id: `evt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
      id: `evt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
      ...d,
      createdAt: new Date()
    }));
    memoryStore.events.push(...inserted);
    return inserted;
  }

  static async countDocuments(query = {}) {
    if (!isUsingFallback()) {
      return await MongooseEvent.countDocuments(query);
    }
    return this.filterArray(memoryStore.events, query).length;
  }

  static async deleteMany(query = {}) {
    if (!isUsingFallback()) {
      return await MongooseEvent.deleteMany(query);
    }
    if (Object.keys(query).length === 0) {
      const count = memoryStore.events.length;
      memoryStore.events = [];
      return { deletedCount: count };
    }
    const initial = memoryStore.events.length;
    memoryStore.events = memoryStore.events.filter(e => !this.filterArray([e], query).length);
    return { deletedCount: initial - memoryStore.events.length };
  }
}

module.exports = NetworkEventModel;
