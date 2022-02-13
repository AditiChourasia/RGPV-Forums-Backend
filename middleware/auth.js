const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // get the token from the header

  const token = req.header("x-auth-token");

  // Check if no token exist

  if (!token) {
    res.status(401).json({ msg: "No token, Authorization denied" });
  }

  // verify the token

  try {
    const decoded = jwt.verify(token, config.get("jwtSecretKey"));
    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ msg: "token is not valid!" });
  }
};
