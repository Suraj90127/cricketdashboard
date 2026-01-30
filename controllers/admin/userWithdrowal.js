import Recharge from "../../models/rechargeModel.js";
import SubAdmin from "../../models/subAdminModel.js";
import UserWithdrawal from "../../models/userwithdrawalModel.js";
// import Recharge from '../../models/rechargeModel.js';

const ALLOWED_STATUSES = ['pending', 'rejected', 'completed'];

export const getAllUserWithdrawals = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const perPage = Math.max(parseInt(limit, 10) || 20, 1);

        const query = {};
        if (status && ALLOWED_STATUSES.includes(status)) {
            query.status = status;
        }

        if (search) {
            const s = String(search).trim();
            query.$or = [
                { userId: { $regex: s, $options: 'i' } },
                { phone: { $regex: s, $options: 'i' } },
                { accountnumber: { $regex: s, $options: 'i' } }
            ];
        }

        const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        const total = await UserWithdrawal.countDocuments(query);
        const withdrawals = await UserWithdrawal.find(query)
            .sort(sort)
            .skip((pageNum - 1) * perPage)
            .limit(perPage)
            .lean();

        return res.status(200).json({
            success: true,
            data: withdrawals,
            meta: {
                page: pageNum,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage) || 1
            }
        });
    } catch (err) {
        console.error('getAllUserWithdrawals error', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: err.message 
        });
    }
}

export const updateWithdrawalStatus = async (req, res) => {
    try {
        // const { id } = req;
        const { withdrawalId, status } = req.body;

     

        if (!withdrawalId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Withdrawal id is required' 
            });
        }
        
        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` 
            });
        }

        const withdrawal = await UserWithdrawal.findById(withdrawalId);
        if (!withdrawal) {
            return res.status(404).json({ 
                success: false, 
                message: 'Withdrawal not found' 
            });
        }

        console.log("withdrawal",withdrawal);
        

        
         const user = await SubAdmin.findById(withdrawal.userId);

         console.log("userrrr",user);
         


        if (withdrawal.status === status) {
             return res.status(200).json({ 
                success: true, 
                message: 'Status unchanged', 
                data: withdrawal 
            });
        }
        if (status === "rejected") {
          user.avbalance += withdrawal.amount;
        }

        const oldStatus = withdrawal.status;
        withdrawal.status = status;
        withdrawal.updatedAt = new Date();
        
        await withdrawal.save();
        await user.save();
        // Log the status change
        console.log(`Withdrawal ${withdrawalId} status changed from ${oldStatus} to ${status}`);

        return res.status(200).json({ 
            success: true, 
            message: 'Status updated successfully', 
            data: withdrawal 
        });
    } catch (err) {
        console.error('updateWithdrawalStatus error', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: err.message 
        });
    }
}


export const getAllUserReachage = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const perPage = Math.max(parseInt(limit, 10) || 20, 1);

        const query = {};
        if (status && ALLOWED_STATUSES.includes(status)) {
            query.status = status;
        }

        if (search) {
            const s = String(search).trim();
            query.$or = [
                { userId: { $regex: s, $options: 'i' } },
                { phone: { $regex: s, $options: 'i' } },
                { accountnumber: { $regex: s, $options: 'i' } }
            ];
        }

        const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        const total = await Recharge.countDocuments(query);
        const RechargeData = await Recharge.find(query)
            .sort(sort)
            .skip((pageNum - 1) * perPage)
            .limit(perPage)
            .lean();

        return res.status(200).json({
            success: true,
            data: RechargeData,
            meta: {
                page: pageNum,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage) || 1
            }
        });
    } catch (err) {
        console.error('Recharge error', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: err.message 
        });
    }
}


// export const updaterecharge = async (req, res) => {
//     try {
//         // const { id } = req;
//         const { rechargeId, status } = req.body;

     

//         if (!rechargeId) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: 'Recharge id is required' 
//             });
//         }
        
//         if (!status || !ALLOWED_STATUSES.includes(status)) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` 
//             });
//         }

//         const recharge = await UserWithdrawal.findById(rechargeId);
//         if (!recharge) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: 'Recharge not found' 
//             });
//         }

//         console.log("recharge",recharge);
        

        
//          const user = await SubAdmin.findById(recharge.userId);
//          console.log("userrrr",user);
         


//         if (recharge.status === status) {
//              return res.status(200).json({ 
//                 success: true, 
//                 message: 'Status unchanged', 
//                 data: recharge 
//             });
//         }
//         // if (status === "rejected") {
//         //   user.avbalance += recharge.amount;
//         // }

//         const oldStatus = recharge.status;
//         recharge.status = status;
//         recharge.updatedAt = new Date();
        
//         await recharge.save();
//         await user.save();
//         // Log the status change
//         console.log(`Recharge ${rechargeId} status changed from ${oldStatus} to ${status}`);

//         return res.status(200).json({ 
//             success: true, 
//             message: 'Status updated successfully', 
//             data: withdrawal 
//         });
//     } catch (err) {
//         console.error('updateWithdrawalStatus error', err);
//         return res.status(500).json({ 
//             success: false, 
//             message: 'Server error',
//             error: err.message 
//         });
//     }
// }

// Backend controller fix
export const updaterecharge = async (req, res) => {
    try {
        const { rechargeId, status } = req.body;

        if (!rechargeId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Recharge id is required' 
            });
        }
        
        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` 
            });
        }

        const recharge = await Recharge.findById(rechargeId); // Changed from UserWithdrawal to Recharge
        if (!recharge) {
            return res.status(404).json({ 
                success: false, 
                message: 'Recharge not found' 
            });
        }

        if (recharge.status === status) {
            return res.status(200).json({ 
                success: true, 
                message: 'Status unchanged', 
                data: recharge 
            });
        }

        const user = await SubAdmin.findById(recharge.userId);

        if (status === "completed") {
            user.avbalance += recharge.money;
         
        }

        // Optional: Handle user balance updates if needed
        // const user = await SubAdmin.findById(recharge.userId);
        // if (status === "completed") {
        //   // Add logic for completed recharge
        // } else if (status === "rejected") {
        //   // Add logic for rejected recharge
        // }

        const oldStatus = recharge.status;
        recharge.status = status;
        recharge.updatedAt = new Date();
        
        await user.save()
        await recharge.save();
        // await user.save(); // If you handle user balance
        
        console.log(`Recharge ${rechargeId} status changed from ${oldStatus} to ${status}`);

        return res.status(200).json({ 
            success: true, 
            message: 'Status updated successfully', 
            data: recharge // Changed from withdrawal to recharge
        });
    } catch (err) {
        console.error('updateRechargeStatus error', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: err.message 
        });
    }
}