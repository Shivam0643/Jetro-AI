const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

const envResult = dotenv.config();
if (envResult.error) {
  console.warn(
    "Warning: No .env file loaded. Using environment variables directly.",
  );
}

const app = express();
app.use(cors());
app.use(express.json());

const applicationsRouter = require("./routes/applications");
const aiRouter = require("./routes/ai");

app.use("/api/applications", applicationsRouter);
app.use("/api/ai", aiRouter);

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://shivamlashkari246_db_user:shivam06@cluster0.uoel9fb.mongodb.net/jetro-ai";

// Start the HTTP server first — don't block on DB connection
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Connect to MongoDB separately — server stays up even if DB is down
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    console.error("Server is still running — fix your MongoDB URI or Atlas IP whitelist.");
  });
