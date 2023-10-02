const express = require("express");
const router = express.Router();

const taskModel = require('../models/task');
const auth = require("../middlewares/auth");

// POST
router.post("/task/", auth, async (req, res) => {
  try {
    const task = new taskModel({
      description: req.body.description,
      completed: req.body.completed,
      owner: req.user.id
    });

    await task.save();

    res.status(200).send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// GET ALL
router.get("/tasks", auth, async (req,res) => {
  try {
    const user = req.user;
    await user.populate('tasks');

    const tasks = user.tasks;

    if (tasks.length === 0) {
      res.status(404).send(`Tasks not found!`);
    } else {
      res.status(200).send(tasks);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// GET ONE
router.get("/task/:id", auth, async (req,res) => {
  try {
    const task = await taskModel.findById(req.params.id);
    await task.populate('owner');

    const isOwner = await task.isOwner(req.user.id);

    if (!task || !isOwner) {
      res.status(404).send(`Task with id "${req.params.id}" not found`);
    } else {
      res.status(200).send(task);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// DELETE ONE
router.delete("/task/:id", auth, async (req, res) => {
  try {
    const task = await taskModel.findById(req.params.id);

    const isOwner = await task.isOwner(req.user.id);

    if (!task || !isOwner) {
      res.status(404).send(`Task with id "${req.params.id}" not found`);
    } else {
      task.remove();
      res.status(200).send(`Task with id "${req.params.id}" has been deleted`);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// UPDATE
router.put("/task/:id", auth, async (req, res) => {
  try {
    let task = await taskModel.findById(req.params.id);
    const isOwner = await task.isOwner(req.user.id);

    if (!task || !isOwner) {
      res.status(404).send(`Task with id "${req.params.id}" not found`);
    } else {
      task.description = req.body.description;
      task.completed = req.body.completed;
      await task.save()

      res.status(200).send(task);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;