// controllers/tennisController.js
import axios from "axios";

// export const fetchTennisData = async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://api.cricketid.xyz/esid?key=uniique5557878&sid=2"
//     );

//     const t1Data = response.data.data.t1 || [];
//     const t2Data = response.data.data.t2 || [];

//     const combinedData = [...t1Data, ...t2Data]
//       .map((match) => ({
//         id: match.gmid,
//         match: match.ename,
//         date: match.stime,
//         iplay: match.iplay,
//         channels: match.f ? ["F"] : [],
//         odds: match.section.reduce((acc, section, index) => {
//           const homeOdds = section.odds[0]?.odds || "0";
//           const awayOdds = section.odds[1]?.odds || "0";

//           acc.push({ home: homeOdds, away: awayOdds });

//           if (index < match.section.length - 1) {
//             acc.push({ home: "0", away: "0" });
//           }

//           return acc;
//         }, []),
//       }))
//       .sort((a, b) => new Date(a.date) - new Date(b.date));

//     res.status(200).json({ success: true, data: combinedData });
//   } catch (error) {
//     console.error("Error fetching tennis data:", error.message);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch tennis data" });
//   }
// };



export const fetchTennisData = async (req, res) => {
  try {
    // 🔥 BACKEND → BACKEND CALL
    const response = await axios.get(
      "https://aura444.org/api/tennis",
      {
        timeout: 10000,
      }
    );

    const data = response.data;

    /**
     * Expected aura444 tennis API format:
     * {
     *   success: true,
     *   data: [...]
     * }
     */

    if (data?.success) {
      return res.status(200).json({
        success: true,
        data: data.data, // 👈 direct forward
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid response from aura tennis API",
    });
  } catch (error) {
    console.error("Error fetching tennis data from aura API:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tennis data",
    });
  }
};


// export const fetchTannisBettingData = async (req, res) => {
//   const { gameid } = req.query;

//   if (!gameid) {
//     return res.status(400).json({ success: false, message: "Missing gameid" });
//   }

//   try {
//     const response = await axios.get(
//       `https://api.cricketid.xyz/getPriveteData?key=uniique5557878&gmid=${gameid}&sid=2`
//     );

//     const json = response.data;

//     if (json.success) {
//       res.status(200).json({
//         success: true,
//         data: response.data,
//       });
//     } else {
//       res
//         .status(500)
//         .json({ success: false, message: "Invalid response from API" });
//     }
//   } catch (error) {
//     console.error("Error in fetchBettingData:", error.message);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };



export const fetchTannisBettingData = async (req, res) => {
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
      `https://aura444.org/api/tannis/betting?gameid=${gameid}`,
      {
        timeout: 10000,
      }
    );

    const data = response.data;

    /**
     * Expected aura444 tennis betting format:
     * {
     *   success: true,
     *   data: {...}
     * }
     */

    if (data?.success) {
      return res.status(200).json({
        success: true,
        data: data.data, // 👈 only betting data
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid response from aura tennis betting API",
    });
  } catch (error) {
    console.error("Error in fetchTannisBettingData:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};