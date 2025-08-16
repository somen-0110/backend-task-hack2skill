require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get("/health", (req, res) => res.status(200).send("OK"));

// Routes
app.use("/auth", authRoutes);
app.use("/", taskRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
});

const port = process.env.PORT || 3000;
connectDB(process.env.MONGO_URI)
  .then(() =>
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    })
  )
  .catch((err) => {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  });
