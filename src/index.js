const express = require("express");

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const {PORT, URL} = require('./configuration');
const connectDb = require('./db/mongoose');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on ${URL}`);
  });
});

module.exports = app;