const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const {TOKEN_KEY} = require('../configuration');

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.left < 7) {
        throw new Error("Password length must be 7 or more!");
      }
      if (value.indexOf("password") >= 0) {
        throw new Error("The password must not contain the word password!");
      }
    }
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (validator.isEmail(value) === false) {
        throw new Error("Email is invalid")
      }
    }
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  age: {
    type: Number,
    validate(value){
      if(value < 0){
        throw new Error("Age can't be below zero")
      }
    }
  },

  tokens: [{
    token: {
      type: String,
      required: true,
    }
  }]
},  { toJSON: { virtuals: true } });

userSchema.pre('save', async function(next) {
  const user = this;

  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.statics.findOneByCredentials = async (email, password) => {
  const user = await module.exports.findOne({email});

  if (!user){
    throw new Error('Incorrect email!');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch){
    throw new Error('Incorrect password');
  }
  return user;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign({_id: user._id.toString()}, TOKEN_KEY);
  user.tokens = user.tokens.concat({token});

  await user.save();

  return token;
};

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject({ virtuals: true })
  delete userObject.password
  delete userObject.tokens

  return userObject
}

userSchema.virtual('tasks', {
  ref: "Task",
  localField: `_id`,
  foreignField: `owner`
})

const User = mongoose.model('User', userSchema);

module.exports = User;