/**
 * @swagger
 * /clientview:
 *   post:
 *     tags:
 *       - Clientview
 *     summary: Client's actions
 *     description: Actions a client can execute like change password, etc
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *
 */
import express from "express";
const router = express.Router();

import { getClientView } from "../controllers/clientviewController.js";

router.route("/").post(getClientView);

export default router;
