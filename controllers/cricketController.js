import axios from "axios";
import adminModel from "../models/adminModel.js";

const OPENAI_API_KEY = "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"

// export const getCricketData = async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://api.cricketid.xyz/esid?sid=4&key=uniique5557878"
//     );
//     // const response = await axios.get(
//     //   "http://130.250.191.174:3009/esid?key=uniique5557878&sid=4"
      
//     // );

//     const admin = await adminModel.findOne({}, "type").lean();
//     if (!admin) {

//       return null;
//     }

//     if (admin.type === 0) {
//       res.status(200).json({ success: false, message: "" });
//     }


//     if (response.data.success) {
//       const t1 = response.data.data.t1 || [];
//       const t2 = response.data.data.t2 || [];
//       const allMatches = [...t1, ...t2];

//       const transformed = allMatches
//         .map((match) => {
//           const team1Odds =
//             match.section && match.section.length >= 1
//               ? {
//                 home: match.section[0].odds[0]?.odds?.toString() || "0",
//                 away: match.section[0].odds[1]?.odds?.toString() || "0",
//               }
//               : { home: "0", away: "0" };

//           const team2Odds =
//             match.section && match.section.length >= 2
//               ? {
//                 home: match.section[1].odds[0]?.odds?.toString() || "0",
//                 away: match.section[1].odds[1]?.odds?.toString() || "0",
//               }
//               : { home: "0", away: "0" };

//           const oddsArr = [team1Odds, { home: "0", away: "0" }, team2Odds];

//           return {
//             id: match.gmid,
//             match: match.ename,
//             date: match.stime,
//             channels: [],
//             odds: oddsArr,
//             inplay: match.iplay,
//           };
//         })
//         .sort((a, b) => new Date(a.date) - new Date(b.date));

//       const now = new Date();

//       const filteredMatches = transformed.filter((match) => {
//         const matchDate = new Date(match.date);
//         return match.inplay === true || matchDate >= now;
//       });

//       res.status(200).json({ success: true, matches: filteredMatches });
//     } else {
//       res
//         .status(400)
//         .json({ success: false, message: "Failed to fetch matches" });
//     }
//   } catch (err) {
//     console.error("Error fetching matches:", err.message);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

export const getCricketData = async (req, res) => {
  try {
    // 🔥 BACKEND → BACKEND API CALL
    const response = await axios.get(
      "https://aura444.org/api/cricket/matches",
      {
        timeout: 10000, // safety
      }
    );

    // console.log("response", response);
    

    // ✅ aura444 API se jo data aata hai
    // expected: { success: true, matches: [...] }
    if (response.data?.success) {
      return res.status(200).json({
        success: true,
        matches: response.data.matches,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch matches from aura API",
      });
    }
  } catch (err) {
    console.error("Error fetching matches from aura API:", err.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// export const fetchCrirketBettingData = async (req, res) => {
//   const { gameid } = req.query;

//   if (!gameid) {
//     return res.status(400).json({ success: false, message: "Missing gameid" });
//   }

//   try {
//     const response = await axios.get(
//       `https://api.cricketid.xyz/getPriveteData?key=uniique5557878&gmid=${gameid}&sid=4`
//     );

//     const json = response.data;

//     if (json.success) {
//       return res.status(200).json({ success: true, data: json });
//     } else {
//       return res.status(500).json({ success: false, message: "Invalid response from API" });
//     }
//   } catch (error) {
//     console.error("Error in fetchBettingData:", error.message);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };


export const fetchCrirketBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({
      success: false,
      message: "Missing gameid",
    });
  }

  try {
    // 🔥 BACKEND → BACKEND CALL
    const response = await axios.get(
      `https://aura444.org/api/cricket/betting?gameid=${gameid}`,
      {
        timeout: 10000, // safety timeout
      }
    );

    const data = response.data;

    /**
     * aura444 betting API expected format:
     * {
     *   success: true,
     *   data: {...}
     * }
     */

    if (data?.success) {
      return res.status(200).json({
        success: true,
        data: data.data, // 👈 IMPORTANT: sirf betting data bhejo
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid response from aura betting API",
    });
  } catch (error) {
    console.error("Error in fetchCrirketBettingData:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//  const gptdagta = async (req, res) => {
//   try {

//     const matchName = "Sri Lanka v Zimbabwe";
// const matchDate = "2024-06-25T14:00:00Z";


// const prompt = `
// You are a professional cricket live match assistant.

// Your task:
// Input Data:
// Match Name: "ICC Men's T20 World Cup 2026 ,Pakistan vs Namibia"
// `;


// const gptRes = await axios.post(
//   "https://api.openai.com/v1/chat/completions",
//   {
//     model: "gpt-4o-mini",
//     messages: [
//       { role: "user", content: prompt }
//     ]
//   },
//   {
//     headers: {
//       Authorization: `Bearer ${OPENAI_API_KEY}`,
//       "Content-Type": "application/json"
//     }
//   }
// );

// console.log("gptRes",gptRes.data.choices[0].message.content);
    
//   } catch (error) {
//     console.error("Error in gptdagta:", error.message);
//     return ({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// gptdagta()