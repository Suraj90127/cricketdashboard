import express from "express";
import { getCasinoData } from "../controllers/casinoController.js";
import {fetchCasinoBettingData} from '../controllers/casinoController.js'

const router = express.Router();

router.get("/casino/data", getCasinoData);
router.get("/casino/betting",fetchCasinoBettingData);

// router.get("/casino/betting", fetchCasinoBettingData);

export default router;