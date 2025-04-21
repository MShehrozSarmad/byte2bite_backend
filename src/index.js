import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";
// import dotenv from "dotenv";

app.get("/", (req, res) => {
  res.send("welcome to byte2bite api server");
})

// establisshind db connection and then starting app
connectDB().then(() => {
  app.listen(process.env.PORT || 8000, () =>
    console.log(`server is running at port: ${process.env.PORT}`)
  );
}).catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1);
});
