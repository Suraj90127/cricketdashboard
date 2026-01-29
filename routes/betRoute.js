import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { getBetHistory, getPendingBets, getPendingBetsAmounts, getProfitlossHistory, getTransactionHistoryByUserAndDate, placeBet, placeFancyBet, updateResultOfBets, } from "../controllers/betController.js";

const router = express.Router();

router.post("/user/place-bet", authMiddleware, placeBet);
router.get("/user/pending-bet", authMiddleware, getPendingBets);
router.get("/user/pending-bet/amounts", authMiddleware, getPendingBetsAmounts);
router.get("/win-loss/all-bet", updateResultOfBets);
router.get('/user/bet/history', authMiddleware, getBetHistory);
router.get('/user/profit-loss/history', authMiddleware, getProfitlossHistory);
router.get("/user/transactions-hisrtory", authMiddleware, getTransactionHistoryByUserAndDate);
router.post("/user/place-fancy-bet", authMiddleware, placeFancyBet);



export default router;
