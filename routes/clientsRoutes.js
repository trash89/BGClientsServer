/**
 * @swagger
 * /clients:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Retrieve the list of clients
 *     description: Retrieve the list of clients
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/client"
 *       '400':
 *         description: Unsuccessful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BasicErrorModel"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/authInvalid"
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags:
 *       - Clients
 *     summary: Create a new client
 *     description: Create a new client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/createClient"
 *           required:
 *             email
 *             password
 *             name
 *             description
 *             address
 *           example:
 *             email: demo1@demo.com
 *             password: secret123
 *             name: demo1
 *             description: description demo1
 *             address: address demo1
 *     responses:
 *       '200':
 *         description: Successful operation, client created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/createClient"
 *                 error:
 *                   type: string
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/badRequest"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/authInvalid"
 *     security:
 *       - bearerAuth: []
 * /clients/{id}:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Get one client details
 *     description: Get one client details
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Client ID
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/badRequest"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/authInvalid"
 *       '404':
 *         description: Client not found, invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/notFound"
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
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Client ID
 *     responses:
 *       '200':
 *         description: Successful operation, client deleted
 *         content:
 *           application/json:
 *             schema:
 *                $ref: "#/components/schemas/deleteClient"
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/badRequest"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/authInvalid"
 *       '404':
 *         description: Client not found, invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/notFound"
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
