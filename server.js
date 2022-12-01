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
  origin: "https://infallible-tereshkova-1c2ff5.netlify.app/",
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

if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
