import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

const generateToken = (user) => {   //generating token
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: 24 * 60 * 60 }
  );
};

export const authenticateToken = (req, res, next) => {  //verifying user
  const token = req.cookies.jwt;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded payload (id, username)
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    const token = generateToken(newUser);
    res.cookie("jwt", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('check1');
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Not a registered email" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    const token = generateToken(user);
    res.cookie("jwt", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.status(201).json({ message: "Login successful", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Logout Controller
export const logoutUser = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout failed:", error);
    return res.status(500).json({ message: "Server error while logging out." });
  }
};