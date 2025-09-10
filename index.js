import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import UserController from "./userController.js";
import { connectUsingMongoose } from "./config/mongoose.config.js";
// import { connectUsingMongoose } from "./config/mongoose.config.js";

const server = express();

const userController = new UserController();

server.use(
  cors({
    origin: "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.get("/", (req, res) => {
  res.send("Welcome to Server");
});

//Generate SeesionId - /seller/sessionid?userId
server.post("/generate-sessionid", (req, res) => {
  userController.generateSessionId(req, res);
});

//Success webhook
server.post("/cashfreeWebhook", (req, res) => {
  userController.handleWebhook(req, res);
});

server.listen(process.env.PORT, () => {
  console.log("Server is running on port : ", process.env.PORT);
  // connectUsingMongoose();
});
