const express = require("express");
const connectDB = require("./config/db");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

app.get("/", (req, res) => res.send("API Running..."));

//  Define Routes

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

app.listen(process.env.PORT || 5000, () =>
  console.log("Listening on the port " + process.env.PORT)
);
