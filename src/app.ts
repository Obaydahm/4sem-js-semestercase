require('dotenv').config();
import express from "express";
import path from "path";
import simpleLogger from "./middlewares/simpleLogger";
//import myCors from "./middlewares/my-cors";
import errorHandler from "./middlewares/errorHandler";
import cors from "cors";
import { requestLogger, errorLogger } from "./middlewares/logger";

const app = express();

app.use([
  express.json(),
  express.static(path.join(process.cwd(), "public")),
  simpleLogger,
  //requestLogger,
  errorLogger,
  cors()
])

let userAPIRouter = require('./routes/userApiDB');
app.use("/api/users", userAPIRouter);

let gameAPIRouter = require('./routes/gameAPI');
app.use("/gameapi", gameAPIRouter);

app.get("/api/dummy", (req, res) => {
  res.json({ msg: "Hello" })
})

app.use(errorHandler)

const PORT = process.env.PORT || 3333;
const server = app.listen(PORT)
console.log(`Server started, listening on port: ${PORT}`)
module.exports.server = server;


