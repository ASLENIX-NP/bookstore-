const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Admin = require("../models/Admin");

const router = express.Router();

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// CUSTOMER SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const adminEmail =
      process.env.ADMIN_EMAIL.toLowerCase().trim();

    if (normalizedEmail === adminEmail) {
      return res.status(403).json({
        success: false,
        message: "This email is reserved for admin",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer",
    });

    const token = createToken({
      id: user._id,
      email: user.email,
      role: "customer",
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "customer",
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
});

// LOGIN: ADMIN + CUSTOMER
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ADMIN LOGIN
    if (role === "admin") {
      const admin = await Admin.findOne({
        email: normalizedEmail,
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      const isPasswordCorrect =
        await bcrypt.compare(
          password,
          admin.password
        );

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      const token = createToken({
        id: admin._id,
        email: admin.email,
        role: "admin",
      });

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: admin._id,
          email: admin.email,
          role: "admin",
        },
      });
    }

    // CUSTOMER LOGIN
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken({
      id: user._id,
      email: user.email,
      role: "customer",
    });

    return res.status(200).json({
      success: true,
      message: "Customer login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "customer",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// RESET PASSWORD
router.post(
  "/reset-password",
  async (req, res) => {
    try {
      const {
        email,
        newPassword,
        role,
      } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Email and new password are required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      let account;

      // CHECK ADMIN
      if (role === "admin") {
        account = await Admin.findOne({
          email: normalizedEmail,
        });
      } else {
        // CHECK CUSTOMER
        account = await User.findOne({
          email: normalizedEmail,
        });
      }

      if (!account) {
        return res.status(404).json({
          success: false,
          message:
            "No account found with this email",
        });
      }

      // CHECK SAME PASSWORD
      const isSamePassword =
        await bcrypt.compare(
          newPassword,
          account.password
        );

      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message:
            "Try different password from previous password",
        });
      }

      // HASH NEW PASSWORD
      const hashedPassword =
        await bcrypt.hash(newPassword, 10);

      account.password = hashedPassword;

      await account.save();

      return res.status(200).json({
        success: true,
        message:
          "Password reset successful. Please login again.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Password reset failed",
      });
    }
  }
);

module.exports = router;