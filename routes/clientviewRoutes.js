/**
 * @swagger
 * /clientview:
 *   post:
 *     tags:
 *       - Clientview
 *     summary: Get the client view on his data
 *     description: Get the data the client will see when it connects
 *     operationId: getClientView
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               email:
 *                 type: string
 *           example:
 *             id: b894d684-0896-4445-a075-28eef2e4e136
 *             email: mr89@laposte.net
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Authentication invalid
 *       '404':
 *         description: Client not found, invalid ID
 *     security:
 *       - bearerAuth: []
 *
 */
import express from "express";
const router = express.Router();

import { getClientView } from "../controllers/clientviewController.js";

router.route("/").post(getClientView);

export default router;
