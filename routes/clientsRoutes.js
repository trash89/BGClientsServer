/**
 * @swagger
 * /clients:
 *   get:
 *     tags:
 *       - clients
 *     summary: Retrieve the list of clients
 *     description: Retrieve the list of clients.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags:
 *       - clients
 *     summary: Create a new client
 *     description: Create a new client.
 *     security:
 *       - bearerAuth: []
 *
 */
import express from "express";
const router = express.Router();

import { getAllClients, getOneClient, createClient, deleteClient, editClient, resetClient } from "../controllers/clientsController.js";

router.route("/").get(getAllClients).post(createClient);
router.route("/:id").get(getOneClient).patch(editClient).delete(deleteClient).put(resetClient);

export default router;
