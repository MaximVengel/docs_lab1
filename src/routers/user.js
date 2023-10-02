const express = require("express");
const router = express.Router();

const userModel = require('../models/user');
const auth = require("../middlewares/auth");

// LOGIN
router.post("/user/login", async (req, res) => {
  try{
    const user = await userModel.findOneByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();

    res.send({user, token});
  }
  catch (e) {
    res.status(400).send(e.message);
  }
});

// ME
router.get("/user/me", auth, async (req, res) => {
  const user = req.user;
  await user.populate('tasks');

  res.send({user});
});

// UPDATE
router.put("/user/", auth, async (req, res) => {
  try {
    let user = req.user;

    if (!user) {
      res.status(404).send(`User with id "${req.params.id}" not found`);
    } else {
      user.email = req.body.email;
      user.age = req.body.age;
      user.name = req.body.name;
      user.password = req.body.password;

      const token = await user.generateAuthToken();
      await user.save()

      res.status(200).send({user, token});
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// REGISTRATION
router.post("/user/", async (req, res) => {
  try {
    const user = new userModel({
      email: req.body.email,
      password: req.body.password,
      age: req.body.age,
      name: req.body.name
    });

    const token = await user.generateAuthToken();

    await user.save();

    res.status(200).send(user);
  } catch (e) {
    res.status(403).send(e.message);
  }
});

// LOGOUT
router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send('Logout success!');
  } catch (e) {
    res.status(500).send();
  }
});

// DELETE ONE
router.delete("/user/", auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).send(`User with id "${req.params.id}" not found`);
    } else {
      user.remove();
      res.status(200).send(`User with id "${req.params.id}" has been deleted`);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});


//--------------------------------------------------------------------------------------------------------------------
// GET ALL
router.get("/users",async (req,res) => {
  try {
    const users = await userModel.find({});

    if (users.length === 0) {
      res.status(404).send(`Users not found`);
    } else {

      users.map(u => u.toJSON());

      res.status(200).send(users);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
})

// GET ONE
router.get("/user/:id", async(req,res) => {
  try {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      res.status(404).send(`User with id "${req.params.id}" not found`);
    } else {
      res.status(200).send(user.toJSON());
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;