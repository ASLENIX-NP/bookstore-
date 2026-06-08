const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const Admin = require("../models/Admin");
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
const router = express.Router();

const otpStore = new Map();

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const normalizeEmail = (email) => {
  return String(email || "").toLowerCase().trim();
};
const buildSafeUser = (user) => {
  return {
    id: user._id,
    _id: user._id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "customer",
    phone: user.phone || "",
    address: user.address || "",
    profileImage: user.profileImage || "",
    birthday: user.birthday || "",
    gender: user.gender || "",
    lastSeen: user.lastSeen || null,
    createdAt: user.createdAt || null,
  };
};

const getOtpKey = (email, role) => {
  return `${role}:${normalizeEmail(email)}`;
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getAccountByRole = async (email, role) => {
  const normalizedEmail = normalizeEmail(email);

  if (role === "admin") {
    return Admin.findOne({ email: normalizedEmail });
  }

  return User.findOne({ email: normalizedEmail });
};

const sendOtpEmail = async ({ email, otp, role }) => {
  const emailUser = String(process.env.EMAIL_USER || "").trim();
  const emailPass = String(process.env.EMAIL_PASS || "").replace(/\s/g, "");
  const emailFrom =
    process.env.EMAIL_FROM || `PatraPatrika Center <${emailUser}>`;

  console.log("OTP sender email:", emailUser);
  console.log("OTP app password length:", emailPass.length);

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in backend .env");
  }

  if (emailPass.length !== 16) {
    throw new Error(
      "Gmail App Password must be 16 characters. Remove spaces from EMAIL_PASS."
    );
  }

  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  // Force IPv4 for Render because IPv6 SMTP is failing
  family: 4,
  lookup: (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback);
  },

  auth: {
    user: emailUser,
    pass: emailPass,
  },

  tls: {
    servername: "smtp.gmail.com",
    rejectUnauthorized: true,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

  const roleLabel = role === "admin" ? "Admin" : "Customer";

  await transporter.sendMail({
    from: emailFrom,
    to: email,
    subject: `PatraPatrika ${roleLabel} Password Reset OTP`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px;">
        <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:18px; padding:28px; border:1px solid #e5e7eb;">
          <h2 style="margin:0; color:#0f172a;">PatraPatrika Center</h2>
          <p style="color:#64748b;">Use this OTP to reset your ${roleLabel.toLowerCase()} password.</p>

          <div style="font-size:34px; font-weight:900; letter-spacing:8px; color:#4f46e5; background:#eef2ff; padding:18px; border-radius:14px; text-align:center;">
            ${otp}
          </div>

          <p style="color:#64748b; margin-top:18px;">This OTP expires in 10 minutes.</p>
          <p style="color:#ef4444; font-size:13px;">If you did not request this, ignore this email.</p>
        </div>
      </div>
    `,
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

    const normalizedEmail = normalizeEmail(email);
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

    if (adminEmail && normalizedEmail === adminEmail) {
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

    const hashedPassword = await bcrypt.hash(password, 10);

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
      user: buildSafeUser(user),
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

  console.log("========== LOGIN REQUEST ==========");
  console.log(req.body);
  console.log("ROLE RECEIVED:", req.body.role);

  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

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

      const isPasswordCorrect = await bcrypt.compare(
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

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

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
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// SEND PASSWORD RESET OTP
router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email, role = "customer" } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const safeRole = role === "admin" ? "admin" : "customer";
    const normalizedEmail = normalizeEmail(email);

    const account = await getAccountByRole(normalizedEmail, safeRole);

    if (!account) {
      return res.status(404).json({
        success: false,
        message:
          safeRole === "admin"
            ? "No admin account found with this email"
            : "No customer account found with this email",
      });
    }

    const otp = generateOtp();

    otpStore.set(getOtpKey(normalizedEmail, safeRole), {
      otp,
      verified: false,
      attempts: 0,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    await sendOtpEmail({
      email: normalizedEmail,
      otp,
      role: safeRole,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
});

// VERIFY OTP
router.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { email, role = "customer", otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const safeRole = role === "admin" ? "admin" : "customer";
    const normalizedEmail = normalizeEmail(email);
    const key = getOtpKey(normalizedEmail, safeRole);

    const storedOtp = otpStore.get(key);

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(key);

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    if (storedOtp.attempts >= 5) {
      otpStore.delete(key);

      return res.status(400).json({
        success: false,
        message: "Too many wrong attempts. Please request a new OTP.",
      });
    }

    if (String(storedOtp.otp) !== String(otp).trim()) {
      storedOtp.attempts += 1;
      otpStore.set(key, storedOtp);

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    storedOtp.verified = true;
    otpStore.set(key, storedOtp);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
});

// RESET PASSWORD AFTER OTP VERIFY
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, role = "customer", otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const safeRole = role === "admin" ? "admin" : "customer";
    const normalizedEmail = normalizeEmail(email);
    const key = getOtpKey(normalizedEmail, safeRole);

    const storedOtp = otpStore.get(key);

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(key);

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    if (!storedOtp.verified || String(storedOtp.otp) !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP before resetting password",
      });
    }

    const account = await getAccountByRole(normalizedEmail, safeRole);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, account.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "Try a different password from previous password",
      });
    }

    account.password = await bcrypt.hash(newPassword, 10);
    await account.save();

    otpStore.delete(key);

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
});

// BLOCK OLD UNSAFE RESET ROUTE
router.post("/reset-password", async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "This reset method is disabled. Please use email OTP reset.",
  });
});
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different",
      });
    }

    let account;

    if (req.user.role === "admin") {
      account = await Admin.findById(req.user.id);
    } else {
      account = await User.findById(req.user.id);
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      account.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    account.password = await bcrypt.hash(newPassword, 10);

    await account.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin profile is not handled here",
      });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Fetch profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin profile is not handled here",
      });
    }

    const existingUser = await User.findById(req.user.id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profileImage = String(req.body.profileImage || "");

    if (profileImage && profileImage.length > 2500000) {
      return res.status(400).json({
        success: false,
        message: "Profile image is too large. Please choose a smaller image.",
      });
    }

    const gender = String(req.body.gender || "").trim();

    const safeGender = ["", "Male", "Female", "Other"].includes(gender)
      ? gender
      : "";

    existingUser.name = String(req.body.name || existingUser.name || "").trim();
    existingUser.phone = String(req.body.phone || "").trim();
    existingUser.address = String(req.body.address || "").trim();
    existingUser.birthday = String(req.body.birthday || "").trim();
    existingUser.gender = safeGender;
    existingUser.profileImage = profileImage || existingUser.profileImage || "";
    existingUser.lastSeen = new Date();

    await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: buildSafeUser(existingUser),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});
module.exports = router;
