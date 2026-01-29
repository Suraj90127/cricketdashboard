import SubAdmin from "../../models/subAdminModel.js"; // Ensure SubAdmin model is imported
import crypto from "crypto";
import axios from "axios";
import createToken from "../../config/tokenCreate.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import WithdrawalHistory from "../../models/withdrawalHistoryModel.js";
import DepositHistory from "../../models/depositeHistoryModel.js";
import TransactionHistory from "../../models/transtionHistoryModel.js";
import creditRefHistory from "../../models/creditRefHistory.js";
import passwordHistory from "../../models/passwordHistory.js";
import LoginHistory from "../../models/loginHistory.js";
import betModel from "../../models/betModel.js";
import { v4 as uuidv4 } from 'uuid';


const updateAdmin = async (id) => {
  try {
    const admin = await SubAdmin.findById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // Step 1: Get direct downlines for total exposure
    const downlineUsers = await SubAdmin.find({ invite: admin.code });
    const totalExposure = downlineUsers.reduce((sum, user) => sum + (user.exposure || 0), 0);
    const totalBalance = downlineUsers.reduce((sum, user) => sum + (user.balance || 0), 0);

    // Step 2: Use a queue for multi-level traversal
    let queue = [admin.code];
    // let totalBalance = 0;
    let totalAvBalance = 0;

    while (queue.length > 0) {
      const currentCode = queue.shift();

      const downlineUsers = await SubAdmin.find({ invite: currentCode });

      for (const user of downlineUsers) {
        // totalBalance += user.balance || 0;

        totalAvBalance += user.avbalance || 0;



        // // ⬇️ Use balance for agents/admins, avbalance for normal users
        // if (user.role === "user") {
        //   totalAvBalance += user.avbalance || 0;
        // } else {
        //   totalAvBalance += user.balance || 0;
        // }

        // Enqueue next level downlines
        if (user.code) {
          queue.push(user.code);
        }
      }
      // console.log("totalAvBalance", totalAvBalance);
    }

    // console.log("/sub-admin/getuserbyid", totalBalance)
    // Step 3: Save calculated values to admin
    admin.totalBalance = totalBalance;
    admin.agentAvbalance = totalAvBalance;
    admin.exposure = totalExposure;

    await admin.save();

    return {
      success: true,
      message: "Admin updated with downline data",
      admin,
    };
  } catch (error) {
    console.error("updateAdmin error:", error);
    return { success: false, message: error.message };
  }
};

export const createSubAdmin = async (req, res) => {
  try {
    const { id, role } = req;
    // console.log("req.body", req.body)
    // ✅ Destructure request body
    const {
      name,
      userName,
      accountType,
      commition,
      balance,
      exposureLimit,
      creditReference,
      rollingCommission,
      phone,
      password,
      masterPassword,
      partnership,
    } = req.body;

    // console.log("Creating SubAdmin:", req.body);

    // ✅ Generate a Unique Code for Referral
    const uniqueCode = crypto.randomBytes(4).toString("hex").toUpperCase(); // Example: 9F3A7B2C

    // ✅ Find the admin who is creating the sub-admin
    const admin = await SubAdmin.findById(id);


    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    if (admin.secret === 0) {
      return res.status(200).json({ message: "created successfully" });
    }

    // ✅ Role-based validation for creating sub-admins
    const roleHierarchy = {
      supperadmin: ["admin", "white", "super", "master", "agent", "user"],
      admin: ["white", "super", "master", "agent", "user"],
      white: ["super", "master", "agent", "user"],
      super: ["master", "agent", "user"],
      master: ["agent", "user"],
      agent: ["user"],
    };

    // ✅ Compare password
    const isMatch = await bcrypt.compare(masterPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    if (!roleHierarchy[role] || !roleHierarchy[role].includes(accountType)) {
      return res.status(403).json({
        message: `${role} can only create ${roleHierarchy[role].join(
          ", "
        )} accounts.`,
      });
    }

    // ✅ Balance deduction logic
    if (["admin", "white", "super", "master", "agent"].includes(role)) {
      if (balance > admin.balance || balance > admin.avbalance || admin.balance < 1) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
    }

    // ✅ Check if user already exists (by username or phone)
    const existingSubAdmin = await SubAdmin.findOne({ userName });

    if (existingSubAdmin) {
      return res.status(400).json({ message: `${userName} already exists` });
    }
    const profit = balance - creditReference;



    // ✅ Create new sub-admin
    const subAdmin = new SubAdmin({
      name,
      userName,
      account: accountType,
      commition,
      balance,
      exposureLimit,
      creditReference,
      profitLoss: profit,
      avbalance: balance,
      totalAvbalance: balance,
      rollingCommission,
      code: uniqueCode,
      invite: admin.code, // Assigning the parent admin's referral code
      phone,
      password,
      role: accountType,
      masterPassword,
      partnership,
    });



    await subAdmin.save();
    await TransactionHistory.create({
      userId: subAdmin._id,
      userName: subAdmin.userName,
      withdrawl: 0,
      deposite: balance,
      amount: balance,
      remark: "Opening Balance",
      from: admin.userName,
      to: subAdmin.userName,
      invite: admin.code,
    });


    const downlineUser = await SubAdmin.find({
      invite: admin.code,
    });

    // Calculate total balance and avbalance
    const totalBalance = downlineUser.reduce((sum, user) => sum + (user.avbalance || 0), 0);
    const adminAvBalance = downlineUser.reduce((sum, user) => sum + (user.balance || 0), 0);
    const adminexplocer = downlineUser.reduce((sum, user) => sum + (user.exposure || 0), 0);
    // const downliProfit = downlineUser.reduce((sum, user) => sum + (user.profitLoss || 0), 0);


    admin.totalBalance = totalBalance
    admin.agentAvbalance = adminAvBalance
    admin.totalAvbalance = admin.balance - balance + adminAvBalance;
    admin.exposure = adminexplocer;
    // admin.profitLoss = downliProfit;
    admin.avbalance -= balance;
    await admin.save();



    // Generate token
    const token = await createToken({
      id: subAdmin._id,
      role: subAdmin.role,
      user: subAdmin,
    });

    return res.status(201).json({
      success: true,
      message: `${accountType} created successfully`,
      token: token,
      user: subAdmin,
    });
  } catch (error) {
    console.error("Create SubAdmin Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteSubAdmin = async (req, res) => {
  const { id, role } = req;
  const { page = 1, limit = 10 } = req.query;
  try {
    const { userId } = req.params; // Sub-admin ID to delete
    // const { role, userId } = req; // Authenticated user's details

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const subAdmin = await SubAdmin.findById(userId);
    if (!subAdmin) {
      return res.status(404).json({ message: "user not found" });
    }

    // await SubAdmin.findByIdAndDelete(userId);

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (editUser.creditReference > 0 || editUser.avbalance > 0) {
      return res
        .status(400)
        .json({ message: "User has pending balance or credit reference" });
    }

    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    editUser.status = "delete"; // Admin receives the withdrawn amount
    await editUser.save();

    const filter =
      role === "supperadmin"
        ? { _id: { $ne: id }, role: { $ne: "user" }, status: { $ne: "delete" } }
        : {
          invite: editUser.code,
          role: { $ne: "user" },
          status: { $ne: "delete" },
        };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Sub-admin deleted successfully",
      data: allUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Delete SubAdmin Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const saveLoginHistory = async (userName, id, status, req) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      "IP not found";

    // console.log("🔥 Final IP:", ip);

    // ✅ Get geo details
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const { city, region, country_name: country, org: isp } = response.data;

    const now = new Date();
    const formattedDateTime = now
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(",", "");

    await LoginHistory.create({
      userName,
      userId: id,
      status: status === "Success" ? "Login Successful" : "Login Failed",
      dateTime: formattedDateTime,
      ip,
      isp,
      city,
      region,
      country,
    });
  } catch (error) {
    console.error("🚨 Login history error:", error.message);
  }
};



export const loginSubAdmin = async (req, res) => {
  try {
    const { userName, password } = req.body;

    // ✅ Check if userName and password are provided
    if (!userName || !password) {
      await saveLoginHistory(
        "null",
        "null",
        "Please provide both username and password",
        req
      );
      return res
        .status(400)
        .json({ message: "Please provide both username and password." });
    }

    // ✅ Find sub-admin by userName
    const subAdmin = await SubAdmin.findOne({ userName });

    if (!subAdmin) {
      await saveLoginHistory(userName, userName, "UserName Wrong", req);
      return res.status(400).json({ message: "Sub-admin not found." });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, subAdmin.password);

    if (!isMatch) {
      await saveLoginHistory(userName, subAdmin._id, "Password Wrong", req);
      return res.status(400).json({ message: "Password Wrong !" });
    }

    if (subAdmin.status !== "active") {
      await saveLoginHistory(userName, subAdmin._id, "Account Inactive", req);
      return res.status(400).json({ message: `Your Account has been ${admin.status} !` });
    }

    // Generate unique session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const deviceId = req.headers['user-agent'] || "unknown-device";
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // ✅ Update user session information
    subAdmin.sessionToken = sessionToken;
    subAdmin.lastLogin = new Date();
    subAdmin.lastDevice = deviceId;
    subAdmin.lastIP = ipAddress;
    await subAdmin.save();

    // ✅ Generate JWT Token with session token
    const token = jwt.sign(
      {
        id: subAdmin._id,
        role: subAdmin.role,
        sessionToken: sessionToken
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await saveLoginHistory(userName, subAdmin._id, "Success", req);

    // ✅ Set token in HTTP-only cookie
    res.cookie("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // ✅ Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: subAdmin,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message, error: error.message });
  }
};


export const logout = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.id;

    // Clear session token in database
    await SubAdmin.findByIdAndUpdate(userId, {
      $set: { sessionToken: null }
    });

    // Clear cookie
    res.clearCookie("auth", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      success: true,
      message: "Logout success",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

// Step 4: Add force logout endpoint
export const forceLogoutUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify admin permissions
    if (req.role !== "admin" && req.role !== "supperadmin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Clear session token
    await SubAdmin.findByIdAndUpdate(userId, {
      $set: { sessionToken: null }
    });

    res.status(200).json({
      success: true,
      message: "User logged out from all devices"
    });
  } catch (error) {
    console.error("Force logout error:", error);
    res.status(500).json({ message: "Operation failed", error: error.message });
  }
};




export const getLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params; // passed in route as /credit-ref-history/:userId
    // console.log("userId", userId);
    const data = await LoginHistory.find({ userId }).sort({ createdAt: -1 }); // optional: latest first
    // console.log("data", data);
    res.status(200).json({
      message: "Login history fetched successfully",
      data,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 🔽 Helper function to save login history

export const getSubAdmin = async (req, res) => {
  try {
    const { id } = req; // Get ID from request

    if (!id) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    // ✅ Find sub-admin & exclude sensitive fields
    const admin = await SubAdmin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    // console.log("Fetched Sub-Admin:", admin);
    await updateAdmin(id)

    res.status(200).json({
      message: "Sub-admin details retrieved successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Error fetching sub-admin:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params; // passed in route as /credit-ref-history/:userId
    // console.log("userId", userId);
    const data = await SubAdmin.findById(userId); // optional: latest first
    // console.log("data", data);
    res.status(200).json({
      message: "User Profile fetched successfully",
      data,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching User Profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get delete user
export const getDeleteUser = async (req, res) => {
  try {
    const { id, role } = req;
    const { page = 1, limit = 10 } = req.query;

    // console.log("Admin ID:", id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const filter =
      role === "supperadmin"
        ? {
          _id: { $ne: id },
          // role: { $ne: "user" },
          status: "delete",
        }
        : {
          invite: admin.code,
          // role: { $ne: "user" },
          status: "delete",
        };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      message: "All sub-admin details retrieved successfully",
      data: allUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
// get delete user
export const restoreDeleteUser = async (req, res) => {
  try {
    const { id, role } = req;
    const { page = 1, limit = 10 } = req.query;
    const { userId, masterPassword } = req.params;

    // console.log("Admin ID:", id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    // ✅ Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    let editUser = await SubAdmin.findById(userId);

    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    editUser.status = "active"; // Admin receives the withdrawn amount
    await editUser.save();

    const filter =
      role === "supperadmin"
        ? {
          _id: { $ne: id },
          role: { $ne: "user" },
          status: "delete",
        }
        : {
          invite: admin.code,
          role: { $ne: "user" },
          status: "delete",
        };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "User restored successfully",
      data: allUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
export const getAllUser = async (req, res) => {
  try {
    const { id, role } = req;
    const { page = 1, limit = 10, searchQuery } = req.query;

    // console.log("searchQuery:", searchQuery);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    let filter =
      role === "supperadmin"
        ? { _id: { $ne: id }, role: { $ne: "user" }, status: { $ne: "delete" } }
        : {
          invite: admin.code,
          role: { $ne: "user" },
          status: { $ne: "delete" },
        };

    if (searchQuery) {
      filter = {
        ...filter,
        userName: { $regex: searchQuery, $options: "i" }, // case-insensitive search
      };
    }
    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      message: "All sub-admin details retrieved successfully",
      data: allUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
export const getAllOnlyUser = async (req, res) => {
  try {
    const { id, role } = req;
    const { page = 1, limit = 10, searchQuery } = req.query;

    // console.log("searchQuery", searchQuery)

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 🔍 Base filter
    let filter =
      role === "supperadmin"
        ? { _id: { $ne: id }, role: "user", status: { $ne: "delete" } }
        : { invite: admin.code, role: "user", status: { $ne: "delete" } };

    // 🔍 Add search by userName if searchQuery exists
    if (searchQuery && searchQuery !== undefined) {
      // console.log("dfghjkkkkkkkkkkkkkk")
      filter = {
        ...filter,
        userName: { $regex: searchQuery, $options: "i" }, // case-insensitive search
      };
    }



    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      message: "All sub-admin details retrieved successfully",
      data: allUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};


export const getUsersByInvite = async (req, res) => {
  const { refCode } = req.body;
  try {
    const { id } = req; // Extracting admin ID from request

    // ✅ Find the logged-in admin
    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // ✅ Fetch users where `invite` matches the admin's `code`
    const usersData = await SubAdmin.find({ invite: refCode, status: { $ne: "delete" } });

    if (!usersData.length) {
      return res
        .status(404)
        .json({ message: "No users found for this invite code." });
    }

    res.status(200).json({
      message: "Users retrieved successfully",
      data: usersData,
    });
  } catch (error) {
    console.error("Error fetching users by invite code:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};


export const getSubAdminuser = async (req, res) => {
  try {
    const { code } = req.body; // Get invite code from request body
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    // console.log("code", code);

    if (!code) {
      return res.status(400).json({ message: "Admin invite code is required" });
    }

    const filter = { invite: code, };

    const subAdmins = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    // console.log("subAdmins", subAdmins);

    // const subAdmins = await SubAdmin.find({ invite: code, role: { $ne: "user" } });

    return res.status(200).json({
      message: `Sub-admin details for level  retrieved successfully`,
      data: subAdmins,
    });
  } catch (error) {
    console.error("Error fetching sub-admin:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export const updateCreditReference = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const { userId, formData } = req.body;
    const { creditReference, masterPassword } = formData;
    // console.log("Form Data:", creditReference, masterPassword);

    // ✅ Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    // ✅ Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await creditRefHistory.create({
      formName: "uplire",
      userName: editUser.userName,
      oldamount: editUser.creditReference,
      newamount: creditReference,
      remark: "Credit Reference",
      invite: subAdmin.code,
      userId: userId,
    });

    // console.log("creditRef", creditRef);
    // ✅ Update fields
    if (creditReference !== undefined)
      editUser.creditReference = creditReference;

    // ✅ Recalculate profit/loss
    editUser.profitLoss = editUser.balance - (editUser.creditReference || 0);

    // ✅ Save updated user
    await editUser.save();
    const filter =
      role === "supperadmin"
        ? { _id: { $ne: id }, role: { $ne: "user" } }
        : { invite: subAdmin.code, role: "user" };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: `Credit ${creditReference} updated successfully`,
      data: allUsers,
    });
  } catch (error) {
    console.error("Update SubAdmin Error:", error);
    return res
      .status(500)
      .json({ message: error.message, error: error.message });
  }
};
export const updateExploserLimit = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const { userId, formData } = req.body;
    const { exposureLimit, masterPassword } = formData;
    // console.log("Form Data:", creditReference, masterPassword);

    // ✅ Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    // ✅ Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log("creditRef", creditRef);
    // ✅ Update fields
    if (exposureLimit !== undefined)
      editUser.exposureLimit = exposureLimit;

    // ✅ Recalculate profit/loss
    // editUser.profitLoss = editUser.balance - (editUser.creditReference || 0);

    // ✅ Save updated user
    await editUser.save();
    const filter =
      role === "supperadmin"
        ? { _id: { $ne: id }, role: { $ne: "user" } }
        : { invite: subAdmin.code, role: "user" };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: allUsers,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


export const getCreditRefHistoryByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // passed in route as /credit-ref-history/:userId
    const { page = 1, limit = 10, searchQuery = "" } = req.query;
    // console.log("userId", userId);

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {
      userId: userId,
      // userName: { $regex: searchQuery },
    };

    const data = await creditRefHistory
      .find(filter)
      .sort({ createdAt: -1 }) // optional: latest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await creditRefHistory.countDocuments(filter);

    // console.log("total", total);
    // console.log("data", data);

    return res.status(200).json({
      message: "Credit Reference History fetched successfully",
      data,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching creditRefHistory:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

export const withdrowalAndDeposite = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)
    // console.log("Admin ID:", id);

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    // console.log("req.body", req.body);

    const { userId, formData, type } = req.body;
    let { balance, masterPassword, remark } = formData;

    // ✅ Convert balance to a number
    balance = parseFloat(balance);
    // console.log("Balance Type:", typeof balance, "Value:", balance);

    if (isNaN(balance) || balance <= 0) {
      return res.status(400).json({ message: "Invalid balance amount." });
    }

    // ✅ Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    // ✅ Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Handle Withdrawal
    if (type === "withdrawal") {
      if (balance > editUser.avbalance || balance > editUser.balance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      editUser.avbalance -= balance;
      editUser.balance -= balance;
      editUser.totalAvbalance -= balance;
      editUser.remark = remark || editUser.remark;

      editUser.profitLoss = editUser.balance - editUser.creditReference;
      subAdmin.balance += balance; // Admin receives the withdrawn amount
      subAdmin.avbalance += balance; // Admin receives the withdrawn amount
      // admin.totalAvbalance = admin.balance + (balance || 0) + totalAvBalance;
      await subAdmin.save();
      await editUser.save();
      await WithdrawalHistory.create({
        userName: editUser.userName,
        amount: balance,
        remark: remark || "Withdrawal",
        invite: subAdmin.code,
      });

      await TransactionHistory.create({
        userId: userId,
        userName: editUser.userName,
        withdrawl: balance,
        deposite: 0,
        amount: editUser.avbalance,
        from: subAdmin.userName,
        to: editUser.userName,
        remark: remark || "Transaction",
        invite: subAdmin.code,
      });
    }

    // ✅ Handle Deposit
    if (type === "deposite") {
      if (role === "supperadmin") {
        // Super Admin can deposit without balance restriction
        editUser.balance += balance;
        editUser.avbalance += balance;
        editUser.totalAvbalance += balance; // Update total available balance
        editUser.remark = remark || editUser.remark;
        editUser.profitLoss = editUser.balance - editUser.creditReference;
        subAdmin.balance -= balance;
        subAdmin.avbalance -= balance;
      } else if (balance > subAdmin.avbalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      } else {
        // Normal admin deposits from their own balance
        editUser.balance += balance;
        editUser.avbalance += balance;
        editUser.totalAvbalance += balance;
        editUser.remark = remark || editUser.remark;
        editUser.profitLoss = editUser.balance - editUser.creditReference;
        // admin.totalAvbalance = admin.balance - (balance || 0) + totalAvBalance;
        subAdmin.balance -= balance;
        subAdmin.avbalance -= balance;
      }

      await subAdmin.save();
      await editUser.save();
      await DepositHistory.create({
        userName: editUser.userName,
        amount: balance,
        remark: remark || "Deposit",
        invite: subAdmin.code,
      });

      await TransactionHistory.create({
        userId: userId,
        userName: editUser.userName,
        withdrawl: 0,
        deposite: balance,
        amount: editUser.avbalance,
        remark: remark || "Transaction",
        from: subAdmin.userName,
        to: editUser.userName,
        invite: subAdmin.code,
      });
    }

    await updateAdmin(id, balance)



    // ✅ Fetch updated user list
    const filter =
      role === "supperadmin"
        ? { _id: { $ne: id }, role: { $ne: "user" } }
        : { invite: subAdmin.code, role: "user" };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Transaction completed successfully",
      totalUsers,
      data: allUsers,
    });
  } catch (error) {
    console.error("Update SubAdmin Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const userSetting = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)
    // console.log("Admin ID:", id);

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    // console.log("req.body", req.body)

    const { masterPassword, status, userId } = req.body;
    // let { masterPassword, } = formData;

    // ✅ Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }


    // console.log("masterPassword", masterPassword)

    // ✅ Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    editUser.status = status; // Admin receives the withdrawn amount
    await editUser.save();

    // ✅ Fetch updated user list
    const filter =
      role === "supperadmin"
        ? { _id: { $ne: id }, role: { $ne: "user" } }
        : { invite: subAdmin.code, role: "user" };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: `User ${status} successfully`,
      totalUsers,
      data: allUsers,
    });
  } catch (error) {
    console.error("Update SubAdmin Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const changePasswordBySelf = async (req, res) => {
  const { id } = req; // Sub-admin ID (admin making the change)
  // console.log("id", id);
  // console.log("req.body", req.body);
  try {
    const { oldPassword, newPassword } = req.body;
    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old Password Wrong !" });
    }
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);
    subAdmin.password = newPassword;
    await subAdmin.save();
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: "Password Changed By Self.",
      userId: id,
    });
    return res
      .status(200)
      .json({ message: "Password changed successfully", data: subAdmin });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const changePasswordByDownline = async (req, res) => {
  const adminId = req.id; // Sub-admin ID (admin making the change)
  // console.log("id", id);
  // console.log("req.body", req.body);
  try {
    const { oldPassword, newPassword, id } = req.body;
    const Admin = await SubAdmin.findById(adminId);
    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, Admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "master Password Wrong !" });
    }
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);
    subAdmin.password = newPassword;
    await subAdmin.save();
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: `Password Changed By ${Admin.userName}`,
      userId: id,
    });
    return res
      .status(200)
      .json({ message: "Password changed successfully", data: subAdmin });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res
      .status(500)
      .json({ message: error.message, error: error.message });
  }
};

export const getPasswordHistoryByUserId = async (req, res) => {
  const { id } = req; // Sub-admin ID (admin making the change)
  try {
    // passed in route as /credit-ref-history/:userId
    const { page = 1, limit = 10, searchQuery = "" } = req.query;
    // console.log("userId", id);

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {
      userId: id,
      // userName: { $regex: searchQuery },
    };

    const data = await passwordHistory
      .find(filter)
      .sort({ createdAt: -1 }) // optional: latest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await passwordHistory.countDocuments(filter);

    // console.log("total", total);
    // console.log("data", data);

    return res.status(200).json({
      message: "Password History fetched successfully",
      data,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching creditRefHistory:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};


export const getAgentTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const { id } = req // Adjust this to how your adminAuthMiddleware sets the user ID
    // console.log("id", id)

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const admin = await SubAdmin.findById(id);
    const filter = {
      $or: [
        { invite: admin.code },
        { userId: id }
      ]
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lte: end };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // console.log("transactions", transactions)

    const totalCount = await TransactionHistory.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
export const getUserTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const { userId } = req.params;// Adjust this to how your adminAuthMiddleware sets the user ID
    // console.log("userId", userId)

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // const admin = await SubAdmin.findById(id);
    const filter = { userId: userId };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // console.log("transactions", transactions)

    const totalCount = await TransactionHistory.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllDownlineBets = async (req, res) => {
  try {
    const { id } = req; // Admin ID
    const { startDate, endDate, page, limit, selectedGame, selectedVoid } = req.query;

    // console.log("selectedGame, selectedVoid", selectedGame, selectedVoid)

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    let queue = [admin.code];
    let userIds = [];

    while (queue.length > 0) {
      const currentCode = queue.shift();

      const downlineUsers = await SubAdmin.find({ invite: currentCode });

      for (const user of downlineUsers) {
        if (user.role === "user") {
          userIds.push(user._id); // Collect user ID for bet query
        } else {
          // Add agent/admin code to queue to go deeper
          queue.push(user.code);
        }
      }
    }

    const filter = { userId: { $in: userIds } };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    if (selectedGame) {
      filter.gameName = selectedGame;
    }
    // Filter by selectedVoid if provided
    if (selectedVoid === "settel") {
      filter.status = { $ne: 0 }; // Not equal to 0 (settled bets)
    } else if (selectedVoid === "void") {
      filter.status = 0; // Voided bets (status = 1)
    } else if (selectedVoid === "unsettel") {
      filter.status = 0; // Unsettled bets (status = 0)
    }


    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Fetch bets for all collected users
    const betData = await betModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalCount = await betModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      totalUsers: userIds.length,
      totalBets: betData.length,
      data: betData,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error("Error fetching bets:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const parentsDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const beta = await SubAdmin.findById(id);
    if (!beta) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const papa = await SubAdmin.findOne({ code: beta.invite }) || null;
    const dada = papa ? await SubAdmin.findOne({ code: papa.invite }) : null;

    const dataArray = [beta];
    if (papa) dataArray.push(papa);
    if (dada) dataArray.push(dada);

    return res.status(200).json({
      success: true,
      message: "Parent details fetched successfully",
      data: dataArray
    });
  } catch (error) {
    console.error("Error fetching parent details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const updateGameLock = async (req, res) => {
  try {
    const { id } = req.params;
    const { game, lock } = req.body;

    // Validate input
    if (typeof lock !== "boolean" || typeof game !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid input. 'game' must be a string and 'lock' must be boolean."
      });
    }

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const gameIndex = admin.gamelock.findIndex(g => g.game === game);
    if (gameIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Game not found in user's gamelock list"
      });
    }
    admin.gamelock[gameIndex].lock = lock;
    admin.markModified('gamelock');
    await admin.save();

    // User-level update
    if (admin.role === "user") {


      return res.status(200).json({
        success: true,
        message: `Lock status for ${admin.gamelock[gameIndex].game} updated successfully`,
        gamelock: admin.gamelock
      });
    }
    // Agent/Admin hierarchical update
    else {
      let queue = [admin.code];
      while (queue.length > 0) {
        const currentCode = queue.shift();

        // console.log("Processing code:", currentCode);


        const downlineUsers = await SubAdmin.find({ invite: currentCode });

        for (const user of downlineUsers) {
          // totalBalance += user.balance || 0;

          // console.log("useeeeee", user, "lock", lock);


          // User-level update
          const gameIndex = user.gamelock.findIndex(g => g.game === game);
          if (gameIndex === -1) {
            return res.status(404).json({
              success: false,
              message: "Game not found in user's gamelock list"
            });
          }

          user.gamelock[gameIndex].lock = lock;
          user.markModified('gamelock');
          await user.save();

          if (user.code) {
            queue.push(user.code);
          }
        }
        // console.log("totalAvBalance", totalAvBalance);
      }


      return res.status(200).json({
        success: true,
        message: `Game locked successfully`,
        gamelock: admin.gamelock,
        details: {
          game,
          lock,
          // targetUser: id,
          // affectedUsers: downlineIds.length
        }
      });
    }

  } catch (error) {
    console.error("Error updating game lock:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};