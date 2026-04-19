import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },
    fullName: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    // Email verification fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,

    // Password reset fields
    passwordResetToken: String,
    passwordResetTokenExpiry: Date,

    // Refresh tokens for multi-device support
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
        deviceName: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  return token;
};

userSchema.methods.addRefreshToken = function (token, expiresAt, deviceName) {
  // Keep only last 5 devices
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift();
  }
  this.refreshTokens.push({
    token: crypto
      .createHash("sha256")
      .update(token)
      .digest("hex"),
    expiresAt,
    deviceName,
  });
};

userSchema.methods.revokeRefreshToken = function (token) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.token !== hashedToken
  );
};

userSchema.methods.revokeAllRefreshTokens = function () {
  this.refreshTokens = [];
};

userSchema.methods.validateRefreshToken = function (token) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const refreshToken = this.refreshTokens.find(
    (rt) => rt.token === hashedToken && rt.expiresAt > new Date()
  );
  return !!refreshToken;
};

export const UserModel = mongoose.model("User", userSchema);
