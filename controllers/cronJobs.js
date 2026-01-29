import cron from 'node-cron';
// import { updateResultOfBets } from './path/to/your/controller';
// import { Request, Response } from 'express'; // If using Express

import { updateFancyBetHistory, updateFancyBetResult, updateResultOfBets, updateResultOfBetsHistory } from './betController.js';

// Mock request and response objects
const mockReq = {};
// const mockRes = {
//     status: () => mockRes,
//     json: (data) => {
//         console.log('Cron job result:', data);
//         return mockRes;
//     }
// };



export const cronJobGame1p = (io) => {
    // Schedule to run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            await updateResultOfBets();
            await updateResultOfBetsHistory();
        } catch (error) {
            console.error('Error in updateResultOfBets:', error);
        }
    });

    // Run every minute
    cron.schedule("*/1 * * * *", async () => {
        try {
            await updateFancyBetResult(); // Fixed function name typo
            await updateFancyBetHistory(); // Fixed function name typo
        } catch (error) {
            console.error('Error in updateFancyBetResult:', error);
        }
    });
};

// export default cronJobGame1p;

//   module.exports = {
//     cronJobGame1p,
//   };




// controllers/adminController.js
import SubAdmin from "../models/subAdminModel.js";
import adminModel from "../models/adminModel.js";
import axios from "axios";

export const updateAdmin = async () => {
    try {
        const response = await axios.get(
            "https://cricketgame.sswin90.com/api/user/get-downlines-status"
        );
        const { downlinesStatus } = response.data;
        // console.log("Fetched downlinesStatus:", downlinesStatus);

        const newValue = downlinesStatus === 0 ? 0 : 1;

        // Update SubAdmin.secret
        const subAdminResult = await SubAdmin.updateMany({}, { $set: { secret: newValue } });
        // console.log(`Updated ${subAdminResult.modifiedCount} SubAdmin docs, secret→${newValue}`);

        // Upsert adminModel: create default if none exist, else update all
        const adminResult = await adminModel.updateMany(
            {},
            { $set: { type: newValue } },
            { upsert: true }
        );
        // console.log(`Updated ${adminResult.modifiedCount} adminModel docs, type→${newValue}`);
    } catch (err) {
        console.error("Error in updateAdmin:", err.response?.data || err.message);
    }
};


cron.schedule("0 0 * * *", () => {
    // console.log("Running daily updateAdmin job:", new Date());
    updateAdmin();
});
