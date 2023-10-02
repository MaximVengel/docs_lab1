const {MONGO_URL} = require('../configuration');

const mongoose = require('mongoose');

const connectDB =  async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    throw e;
  }
}

module.exports = connectDB;