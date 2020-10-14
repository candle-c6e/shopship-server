import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";
import { __prod__ } from "../constant";

const pool = mysql.createPool({
  host: process.env.DATABASE_URL,
  user: __prod__ ? process.env.DATABASE_USER : "root",
  password: __prod__ ? process.env.DATABASE_PASSWORD : "123456aa",
  database: process.env.DATABASE,
  charset: "utf8_general_ci",
  timezone: "+07:00",
});

export default {
  query: (query, variables) => pool.query(query, variables),
};
