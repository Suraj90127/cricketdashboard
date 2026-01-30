import express from "express";
import { getAllUserReachage, getAllUserWithdrawals, updaterecharge, updateWithdrawalStatus } from "../../controllers/admin/userWithdrowal.js";


const router = express.Router();


router.get("/user/withdrawals-list", getAllUserWithdrawals);
router.put("/user-withdrawals/status", updateWithdrawalStatus);
router.get("/user/recharge-list", getAllUserReachage);
router.put("/user-recharge/status", updaterecharge);



export default router;