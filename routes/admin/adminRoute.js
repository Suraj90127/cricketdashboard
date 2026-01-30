import express from "express";
import { addwhatsapp } from "../../controllers/admin/adminController.js";
import { adminAuthMiddleware } from "../../middleware/authMiddleware.js";


const router = express.Router();


router.get("/add-whatsapp", addwhatsapp);


export default router;