import adminModel from "../models/adminModel.js";
import axios from "axios";

// To fetch casino data (name and image) from the API
export const getCasinoData = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.cricketid.xyz/casino/tableid?key=demo1"
    );

    // If you want to use admin model later, uncomment below
    // const admin = await adminModel.findOne({}, "type").lean();
    // if (!admin) {
    //   return res.status(404).json({ success: false, message: "Admin not found" });
    // }
    // if (admin.type === 0) {
    //   return res.status(200).json({ success: false, message: "" });
    // }

    if (response.data.success && Array.isArray(response.data.data.t1)) {
      const transformed = response.data.data.t1.map((game) => ({
        id: game.gid,
        gameType: game.gmid,
        image: game.imgpath ? `/images/casino/${game.imgpath}` : null,
      }));
      console.log("Transformed casino data:", transformed);

      return res.status(200).json({ success: true, data: transformed });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Invalid data format" });
    }
  } catch (error) {
    console.error("Error fetching casino data:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//To fetch casino betting data
export const fetchCasinoBettingData = async (req, res) => {
  const { type } = req.query;
  if (!type) {
    return res
      .status(400)
      .json({ success: false, message: "Missing gameType" });
  }

  try {
    const response = await axios.get(
      `https://api.cricketid.xyz/casino/data?key=demo1&type=${type}`
    );

    const json = response.data;
    console.log("Casino API response:",json);
    if (json.success) {
      return res.status(200).json({ success: true, data: json.data });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Invalid response from Api" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error while fetching casino betting data",
        error: error?.message,
      });
  }
};
