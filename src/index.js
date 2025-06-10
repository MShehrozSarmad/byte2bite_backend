import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// establisshind db connection and then starting app
connectDB().then(() => {
  app.listen(process.env.PORT || 8000, () =>
    console.log(`server is running at port: ${process.env.PORT}`)
  );
}).catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1);
});
