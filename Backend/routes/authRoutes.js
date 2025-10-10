const express= require('express');
const authController= require('../middleware/authController.js');

const router = express.Router();

router.get("/check", authController.authenticateToken, (req, res) => {
  res.json({ message: "Authenticated", email: req.user.email });
});

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.post("/logout", authController.logoutUser);

module.exports = router;

