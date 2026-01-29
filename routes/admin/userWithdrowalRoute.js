import express from "express";
import { getAllUserWithdrawals, updateWithdrawalStatus } from "../../controllers/admin/userWithdrowal.js";


const router = express.Router();


router.get("/user/withdrawals-list", getAllUserWithdrawals);
router.put("/user-withdrawals/status", updateWithdrawalStatus);



export default router;