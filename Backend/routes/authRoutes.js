import express from 'express';
import * as authController from '../middleware/authController.js';

const router = express.Router();

router.get("/check", authController.authenticateToken, (req, res) => {
  res.json({ message: "Authenticated", email: req.user.email, role: req.user.role });
});

router.get("/check-admin", authController.authenticateToken, authController.authorizeAdmin, (req, res) => {
  res.json({ message: "Admin authenticated", email: req.user.email, role: req.user.role });
});

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.post("/logout", authController.logoutUser);

export default router;
