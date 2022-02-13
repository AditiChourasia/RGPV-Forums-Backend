const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/user");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");

// Validating arrays

const validateUser = [
  check("email", "Please include a valid email !").isEmail(),
  check("password", "Password is required !").exists(),
];

// @route     GET api/auth
// @desc      Test Route
// @access    Public
router.get("/", auth, async (req, res) => {
  try {
    console.log(req.user.id);
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error!");
  }
});

// @route     POST api/auth/login
// @desc      Authenticate user and get token
// @access    Public

router.post("/login", validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check if user exist

    if (!user)
      return res
        .status(404)
        .json({ errors: [{ msg: "Invalid credentials !" }] });

    // check password

    const isMatch = await bcrypt.compare(password, user.password);

    console.log(isMatch);

    if (!isMatch)
      return res
        .status(404)
        .json({ errors: [{ msg: "Invalid credentials !" }] });

    // return jsonWebToken

    const payload = {
      user: { id: user.id },
    };

    const token = jwt.sign(
      payload,
      config.get("jwtSecretKey"),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    return res.status(500).send("Server error");
  }
});

module.exports = router;
