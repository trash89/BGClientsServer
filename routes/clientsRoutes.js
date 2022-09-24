/**
 * @swagger
 * /clients:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Retrieve the list of clients
 *     description: Retrieve the list of clients.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags:
 *       - Clients
 *     summary: Create a new client
 *     description: Create a new client.
 *     security:
 *       - bearerAuth: []
 * /clients/{id}:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Get one client details
 *     description: Get one client details
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags:
 *       - Clients
 *     summary: Create a new client
 *     description: Create a new client.
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Clients
 *     summary: Delete a client
 *     description: Delete a client
 *     security:
 *       - bearerAuth: []
 *   put:
 *     tags:
 *       - Clients
 *     summary: Reset the password for a client
 *     description: Reset the password for a client
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
