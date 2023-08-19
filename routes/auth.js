const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Register User
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const newUser = new User({
    username,
    email,
    password: hash,
  });

  try {
    const savedUser = await newUser.save();
    const { password, ...others } = savedUser._doc;
    res.status(201).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Login User
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json("Wrong Credentials!");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "3d" }
      );

      const { password, ...others } = user._doc;
      return res.status(200).json({ ...others, accessToken });
    } else {
      return res.status(401).json("Wrong Credentials!");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
