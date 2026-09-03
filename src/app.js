const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const http = require("http");

const connectDB = require("./config/database");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const classRouter = require("./routes/class");
const initializeSocket = require("./sockets/quizSocket");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", classRouter);

const server = http.createServer(app);
initializeSocket(server);

// ⬇️ catches everything that didn't match above
app.use((req, res) => {
  res.status(404).send("Route not found !");
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Database connection established...");
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err);
  });
