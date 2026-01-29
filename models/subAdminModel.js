import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const subAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    account: { type: String, required: true },
    code: { type: String, required: true },
    commition: { type: String },
    balance: { type: Number, default: 0, get: (value) => parseFloat(value.toFixed(2)) }, // Changed from String to Number
    totalBalance: { type: Number, default: 0, get: (value) => parseFloat(value.toFixed(2)) }, // Changed from String to Number
    profitLoss: { type: Number, default: 0 }, // Changed from String to Number
    avbalance: { type: Number, default: 0 }, // Changed from String to Number
    agentAvbalance: { type: Number, default: 0 }, // Changed from String to Number
    totalAvbalance: { type: Number, default: 0 }, // Changed from String to Number
    exposure: { type: Number, default: 0 },
    totalExposure: { type: Number, default: 0 },
    exposureLimit: { type: Number, default: 0 },
    creditReference: { type: Number, default: 0 },
    rollingCommission: { type: Number, default: 0 },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    secret: { type: Number, default: 1 },
    partnership: { type: String },
    invite: { type: String },
    masterPassword: { type: String },
    status: { type: String, default: "active" },
    secret: { type: Number, default: 1 },
    remark: { type: String },
    role: {
      type: String,
      enum: [
        "supperadmin",
        "admin",
        "white",
        "super",
        "master",
        "agent",
        "user",
      ], // Only allow these roles
      default: "user",
    },
    gamelock: {
      type: Array,
      default: [
        { game: "cricket", lock: true },
        { game: "tennis", lock: true },
        { game: "soccer", lock: true },
        { game: "Casino", lock: true },
        { game: "Greyhound Racing", lock: true },
        { game: "Horse Racing", lock: true },
        { game: "Basketball", lock: true },
        { game: "Lottery", lock: true },
      ]
    },
    sessionToken: { type: String, default: null },
    lastLogin: { type: Date, default: null },
    lastDevice: { type: String, default: null },
    lastIP: { type: String, default: null },

  },
  { timestamps: true }
);

// Hash password before saving
subAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
subAdminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const SubAdmin = mongoose.model("SubAdmin", subAdminSchema);
export default SubAdmin;
