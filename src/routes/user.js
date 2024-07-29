const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("../middleware/validation");

// User registration and login routes
router.post("/register", validation.validateUser, userController.register);
router.post("/login", userController.login);

// News preferences and fetching routes
router.get(
  "/preferences",
  userController.authenticate,
  userController.getPreferences
);
router.put(
  "/preferences",
  userController.authenticate,
  userController.updatePreferences
);
router.get("/news", userController.authenticate, userController.getNews);

module.exports = router;

