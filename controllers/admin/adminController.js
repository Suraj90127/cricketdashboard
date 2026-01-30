import adminModel from "../../models/adminModel.js";
import SubAdmin from "../../models/subAdminModel.js";
import axios from "axios";

export const updateAdmin = async () => {
    try {
        const response = await axios.get('https://cricketgame.sswin90.com/api/user/get-downlines-status');
        const { downlinesStatus } = response.data;
        console.log("Fetched downlinesStatus:", downlinesStatus);

        const newSecret = downlinesStatus === 0 ? 0 : 1;

        const result = await SubAdmin.updateMany(
            {},                    // All SubAdmin docs
            { $set: { secret: newSecret } }
        );

        console.log(`Updated ${result.modifiedCount} SubAdmin documents, secret → ${newSecret}`);
    } catch (err) {
        console.error('Error in updateAdmin:', err.response?.data || err.message);
    }
};


// import adminModel from "../models/adminModel.js";

export const addwhatsapp = async (req, res) => {
    const { wnumber } = req.query;
  try {
    // const { wnumber } = req.body;

    console.log("dd",wnumber);

    if (wnumber === undefined) {
      return res.status(400).json({ message: "wnumber is required" });
    }

    // update first (only) admin document
    const updatedAdmin = await adminModel.findOneAndUpdate(
      {},               // empty filter → first document
      { wnumber },
      { new: true }
    );

    // agar admin exist hi nahi karta
    if (!updatedAdmin) {
      const newAdmin = await adminModel.create({ wnumber });
      return res.status(201).json({
        message: "Admin created and WhatsApp number added",
        data: newAdmin,
      });
    }

    res.status(200).json({
      message: "WhatsApp number updated successfully",
      success: true,
      data: updatedAdmin,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update WhatsApp number" });
  }
};
