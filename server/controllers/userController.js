const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY || "fallback_secret_key";
const fs = require("fs");
const path = require("path");

const userController = {
  signup: async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      const newUser = new User({ username, email, password });
      await newUser.save();

      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ error: "Invalid email" });
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      const token = jwt.sign({ user: { _id: user._id } }, secretKey);

      //res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });

      res.json({ message: 'Login successful!' , jwtToken: token});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  logoutUser: (req, res) => {
    res.clearCookie("token");

    res.json({ message: "Logout successful!" });
  },

  getUserById: async (req, res) => {
    const userId = req.params.userId;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userWithoutPassword = { ...user.toObject(), password: undefined };

      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  followUser: async (req, res) => {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    try {
      const targetUser = await User.findByIdAndUpdate(
        targetUserId,
        {
          $push: {
            activities: {
              type: "follow",
              timestamp: new Date(),
              user: userId,
            },
          },
        },
        { new: true }
      );

      await User.findByIdAndUpdate(userId, {
        $addToSet: { following: targetUserId },
      });

      res.json({ message: "User followed successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  unfollowUser: async (req, res) => {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { following: targetUserId },
      });

      res.json({ message: "User unfollowed successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getUserActivities: async (req, res) => {
    const userId = req.user._id;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const activities = user.activities;

      res.json({ activities });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateUsername: async (req, res) => {
    const userId = req.user._id;
    const { newUsername } = req.body;

    try {
      if (newUsername) {
        const usernameExists = await User.findOne({ username: newUsername });
        if (usernameExists) {
          return res.status(400).json({ error: "Username already in use" });
        }

        await User.findByIdAndUpdate(userId, { username: newUsername });
      }

      res.json({ message: "Username updated successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateProfilePicture: async (req, res) => {
    const userId = req.user._id;

    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "No profile picture uploaded" });
      }

      const profilePicture = req.files.profilePicture;

      // Handle the file
      const uploadPath = path.join(
        __dirname,
        "..",
        "uploads",
        "profilePictures"
      );

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const profilePicturePath = path.join(uploadPath, profilePicture.name);

      // Save the profile picture to the specified path
      profilePicture.mv(profilePicturePath, (err) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ error: "Error uploading profile picture" });
        }

        User.findByIdAndUpdate(
          userId,
          {
            profilePicture: `../uploads/profilePictures/${profilePicture.name}`,
          },
          { new: true }
        )
          .then((updatedUser) => {
            if (!updatedUser) {
              return res.status(404).json({ error: "User not found" });
            }

            res.json(updatedUser);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
          });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = userController;
