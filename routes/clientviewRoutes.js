import express from "express";
const router = express.Router();

import { getClientView } from "../controllers/clientviewController.js";

router.route("/").post(getClientView);

export default router;
