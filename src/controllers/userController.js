const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

let users = []; // In-memory data store

// Middleware to verify JWT token
exports.authenticate = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, "sujit_jwt_secret");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// User registration
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
    preferences: [],
  };

  users.push(user);

  res.status(201).json({ message: "User registered successfully" });
};

// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id }, "sujit_jwt_secret", {
    expiresIn: "1h",
  });

  res.json({ token });
};

// Get news preferences
exports.getPreferences = (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  res.json(user.preferences);
};

// Update news preferences
exports.updatePreferences = (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  user.preferences = req.body.preferences || user.preferences;
  res.json({ message: "Preferences updated successfully" });
};

// Fetch news based on preferences
exports.getNews = async (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  const preferences = user.preferences.join(",");
  const newsapikey = "4b9acaa3-2220-43a0-9c7c-6c4b124e42b8";

  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=${preferences}&apiKey=${newsapikey}`
    );
    res.json(response.data.articles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch news articles" });
  }
};

