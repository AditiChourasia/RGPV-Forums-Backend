const express = require("express");
const connectDB = require("./config/db");
const app = express();
const cors = require("cors");
require("dotenv").config();
// const fileUpload = require("express-fileupload");
var bodyParser = require("body-parser");

// Connect Database
connectDB();
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

// Init Middleware
app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(cors(corsOptions));
app.set("view engine", "ejs");
// app.use(fileUpload());

app.get("/", (req, res) => res.send("API Running..."));

//  Define Routes

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

app.listen(5000, () => console.log("Listening on the port " + 5000));
