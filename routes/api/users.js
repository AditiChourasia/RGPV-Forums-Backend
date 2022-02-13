const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/user");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

// Validation arrays

const validateUser = [
  check("name", "Name is required! !").not().isEmpty(),
  check("email", "Please include a valid email !").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters !"
  ).isLength({ min: 6 }),
];

// Routes

// @route     POST api/users
// @desc      Register a user Route
// @access    Public

router.post("/register", validateUser, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check if user exist

    if (user)
      return res.status(400).json({ errors: [{ msg: "User already exist" }] });

    // Get users gravatar

    const avatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm",
    });

    const newUser = new User({
      name,
      email,
      avatar,
      password,
    });

    // Encrypt password

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();

    // return jsonWebToken

    const payload = {
      user: { id: newUser.id },
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
    console.log(err.message);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
