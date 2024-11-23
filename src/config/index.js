const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: 8086,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: "sarvusahitya",
  EXCHANGE_NAME: "SAHITYA",
  MSG_QUEUE_URL:
    "amqps://nsdqumap:krrTgIUj89n4J4Cg3_uN5PjGiBJiWQQI@puffin.rmq2.cloudamqp.com/nsdqumap",
  SAHITYA_SERVICE: "SAHITYA_SERVICE",
  AWS_REGION: "eu-north-1",
  AWS_ACCESS_KEY_ID: "",
  AWS_SECRET_ACCESS_KEY: "",
  AWS_SESSION_TOKEN: "",
};
