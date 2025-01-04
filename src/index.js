const express = require("express");
const { PORT } = require("./config");
const { databaseConnection } = require("./database");
const expressApp = require("./express-app");
const errorHandler = require("./utils/errors");
const app = express();

const router = express.Router();
const serverless = require("serverless-http");
const StartServer = async () => {
  const cors = require("cors");
  app.use(
    cors({
      origin: "*",
      methods: "*",
      allowedHeaders: "*",
    })
  );

  await databaseConnection();

  router.get("/", (req, res) => res.send("Welcome To Sarvu Sahitya"));

  await expressApp(router);
  errorHandler(app);
  app
    .listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    })
    .on("error", (err) => {
      console.log(err);
      process.exit();
    })
    .on("close", () => {
      channel.close();
    });
};

app.use("/.netlify/functions/api", router);
StartServer();
