import 'dotenv/config';
import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

const app = express();
// connectDB();

app.listen(process.env.PORT, () =>
  console.log(`app listening on ${process.env.PORT}`)
);
