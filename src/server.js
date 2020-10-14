import "regenerator-runtime/runtime";
import "core-js/stable";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";

import router from "./routes";
import { COOKIE_NAME, __prod__ } from "./constant";

const app = express();
const PORT = process.env.PORT || 4000;

const RedisStore = connectRedis(session);

let redis;

redis = new Redis();

app.use(compression());
app.use(helmet());
app.use(
  cors({
    origin: __prod__ ? "http://jjams.co" : "http://localhost:3000",
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: COOKIE_NAME,
    store: new RedisStore({
      client: redis,
      disableTouch: true,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false,
  })
);
app.use((req, res, next) => {
  req.redis = redis;
  next();
});

app.use("/", router);

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ${PORT}`);
});
