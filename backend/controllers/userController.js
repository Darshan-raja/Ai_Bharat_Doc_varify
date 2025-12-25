import User from "../models/User.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Use explicit JWT secret with a safe dev fallback; require in production
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret_change_me' : undefined);


// Create transporter only if credentials exist to avoid runtime 500s
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phoneNumber,
      workingDomain,
      organization,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !phoneNumber ||
      !workingDomain ||
      !organization
    ) {
      return res.json({ success: false, message: "Please fill in all fields" });
    }

    // Validate phone number format (at least 10 digits)
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Please enter a valid phone number (at least 10 digits)" 
      });
    }

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return res.status(400).json({ success: false, message: "User with this email already registered" });
    }

    // Check if user already exists by phone number
    const existingUserByPhone = await User.findOne({ phoneNumber: phoneNumber.trim() });
    if (existingUserByPhone) {
      return res.status(400).json({ success: false, message: "User with this phone number already registered" });
    }

    const newUser = new User({
      firstname,
      lastname,
      email: email.toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      workingDomain,
      organization,
      status: 'pending', // New users are pending approval
    });

    const user = await newUser.save();

    res.json({ 
      success: true, 
      message: "Registration successful! Your account is pending admin approval.",
      user: { 
        id: user._id,
        name: user.firstname, 
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.log(error);
    // Handle duplicate key error for phoneNumber
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `User with this ${field === 'phoneNumber' ? 'phone number' : field} already exists` 
      });
    }
    res.json({ success: false, message: error.message });
  }
};


export const sendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user is approved by admin
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval. Please wait for confirmation email."
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: `Your account has been rejected by the admin. Reason: ${user.rejectionReason || 'Not specified'}`
      });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Send email OTP if transporter is configured; otherwise skip sending in dev
    try {
      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Your Login OTP',
          text: `Your OTP code is ${otpCode}`,
          html: `<p>Your OTP code is <strong>${otpCode}</strong></p>`,
        });
      }

      // Update user with OTP details
      user.otp = {
        code: otpCode,
        expiresAt,
        sentTo: transporter ? ['email'] : []
      };
      await user.save();

      const responsePayload = {
        success: true,
        message: transporter ? 'OTP sent successfully' : 'OTP generated (email not configured)',
        otpSentTo: transporter ? ['email'] : []
      };

      // Log OTP in development for quick testing
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] OTP for ${user.email}: ${otpCode}`);
      }

      // In non-production, return OTP for easier local testing
      if (process.env.NODE_ENV !== 'production') {
        responsePayload.debugOtp = otpCode;
      }

      res.json(responsePayload);

    } catch (emailError) {
      console.error('Error handling OTP send:', emailError);
      res.status(500).json({ success: false, message: 'Failed to process OTP' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user account is approved
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval. Please wait for confirmation."
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: `Your account has been rejected. Reason: ${user.rejectionReason || 'Not specified'}`
      });
    }

    // Check if OTP exists, matches, and isn't expired
    if (!user.otp ||
      user.otp.code !== otp ||
      new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Clear the OTP after successful verification
    user.otp = undefined;
    await user.save();

    // Generate JWT token
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set. Configure it in the environment.');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '28d'
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 28 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        name: user.firstname || user.email,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
};



export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      success: true,
      data: {
        name: user.firstname || user.email,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const userData = users.map(user => ({
      id: user._id,
      name: user.firstname || user.email,
      email: user.email,
    }));

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        name: user.firstname || user.email,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateUserResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, institution } = req.body;
    if (!name || !institution) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { lastResults: { name, institution, date: new Date() } } },
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchResults = async (req, res) => {
  try {
    // user id comes from auth middleware (JWT decoded)
    const user = await User.findById(req.user.id).select("lastResults");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: user.lastResults, // only send the array
    });
  } catch (error) {
    console.error("Error in fetchResults:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const authenticateAdmin = async (req, res) => {
  try {
    const { adminCode } = req.body;

    if (!adminCode) {
      return res.status(400).json({ success: false, message: "Admin code is required" });
    }

    const adminCodeFromEnv = process.env.ADMIN_CODE || 'admin@123';

    if (adminCode !== adminCodeFromEnv) {
      return res.status(401).json({ success: false, message: "Invalid admin code" });
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set. Configure it in the environment.');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const adminToken = jwt.sign({ role: 'admin' }, JWT_SECRET, {
      expiresIn: '4h'
    });

    res.cookie("adminToken", adminToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 4 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Admin authenticated successfully",
      token: adminToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' }).select('-otp');

    res.json({
      success: true,
      data: pendingUsers.map(user => ({
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        workingDomain: user.workingDomain,
        organization: user.organization,
        status: user.status,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error("Error in getPendingUsers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'approved', rejectionReason: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User approved successfully",
      data: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Error in approveUser:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ success: false, message: "User ID and rejection reason are required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User rejected successfully",
      data: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        status: user.status,
        rejectionReason: user.rejectionReason
      }
    });
  } catch (error) {
    console.error("Error in rejectUser:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};