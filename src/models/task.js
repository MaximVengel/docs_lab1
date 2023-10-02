const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },

  completed: {
    type: Boolean,
    default: false
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
})

taskSchema.methods.isOwner = async function(userId) {
  const task = this;

  return task.owner._id.toString().toLowerCase() === userId
}

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;