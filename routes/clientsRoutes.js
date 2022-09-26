/**
 * @swagger
 * /clients:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Retrieve the list of clients
 *     description: Retrieve the list of clients
 *     operationId: getAllClients
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/client"
 *                 error:
 *                   type: string
 *                 count:
 *                   type: integer
 *       '400':
 *         description: Unsuccessful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/BasicErrorModel"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/authInvalid"
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags:
 *       - Clients
 *     summary: Create a new client
 *     description: Create a new client
 *     operationId: createClient
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
 *               $ref: "#/components/responses/badRequest"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/authInvalid"
 *     security:
 *       - bearerAuth: []
 * /clients/{id}:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Get one client details
 *     description: Get one client details
 *     operationId: getOneClient
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   $ref: "#/components/schemas/client"
 *                 events:
 *                   type: object
 *                   properties:
 *                     events:
 *                        type: array
 *                        items:
 *                          $ref: "#/components/schemas/event"
 *                     count:
 *                       type: integer
 *                 userfiles:
 *                   type: object
 *                   properties:
 *                     userfiles:
 *                        type: array
 *                        items:
 *                          $ref: "#/components/schemas/userfile"
 *                     count:
 *                       type: integer
 *                 error:
 *                   type: string
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/badRequest"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/authInvalid"
 *       '404':
 *         description: Client not found, invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/notFound"
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags:
 *       - Clients
 *     summary: Edit a client's data
 *     description: Edit a client's data
 *     operationId: editClient
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/client"
 *           example:
 *             id: 101
 *             email: demo1@demo.com
 *             name: demo1
 *             description: description demo1
 *             address: address demo1
 *             user_id: c8528044-f7f7-4a29-b22f-8261fc533310
 *             localuser_id: 138
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/client"
 *                 error:
 *                   type: string
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/authInvalid"
 *       '404':
 *         description: Client not found, invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/notFound"
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Clients
 *     summary: Delete a client
 *     description: Delete a client
 *     operationId: deleteClient
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
 *               $ref: "#/components/responses/badRequest"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/authInvalid"
 *       '404':
 *         description: Client not found, invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/notFound"
 *     security:
 *       - bearerAuth: []
 *
 * /clients/pwd/{id}:
 *   post:
 *     tags:
 *       - Clients
 *     summary: Change the password for a client
 *     description: Change the password for a client
 *     operationId: resetPassword
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Client ID
 *         example:
 *           101
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *           example:
 *             password: secret123
 *     responses:
 *       '200':
 *         description: Successful operation, password changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   $ref: "#/components/schemas/client"
 *                 error:
 *                   type: string
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/badRequest"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/authInvalid"
 *       '404':
 *         description: Client not found, invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/notFound"
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags:
 *       - Clients
 *     summary: Send a reset password link to a client
 *     description: Send a reset password link to a client's email
 *     operationId: sendResetLink
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Client ID
 *         example:
 *           93
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *           example:
 *             email: mr89@laposte.net
 *     responses:
 *       '200':
 *         description: Successful operation, reset link sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   $ref: "#/components/schemas/client"
 *                 error:
 *                   type: string
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/badRequest"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/authInvalid"
 *       '404':
 *         description: Client not found, invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/notFound"
 *     security:
 *       - bearerAuth: []
 *   put:
 *     tags:
 *       - Clients
 *     summary: The client change his password
 *     description: The client change his password
 *     operationId: changePassword
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Client ID
 *         example:
 *           93
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password1:
 *                 type: string
 *               password2:
 *                 type: string
 *               access_token:
 *                 type: string
 *           example:
 *             email: mr89@laposte.net
 *             password1: secret1234
 *             password2: secret1234
 *             access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjY0MTk5NDQxLCJzdWIiOiJiODk0ZDY4NC0wODk2LTQ0NDUtYTA3NS0yOGVlZjJlNGUxMzYiLCJlbWFpbCI6Im1yODlAbGFwb3N0ZS5uZXQiLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7fSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJzZXNzaW9uX2lkIjoiZGExYzJjODgtMTYyMy00NWYyLWFiOWYtZjk5YjYyYzY2NjQxIn0.g0rUytC9apBQatpckocODoX9FvUhwKnM-n5DwPYCVCw
 *     responses:
 *       '200':
 *         description: Successful operation, password changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   $ref: "#/components/schemas/client"
 *                 error:
 *                   type: string
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/badRequest"
 *       '401':
 *         description: Authentication invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/authInvalid"
 *       '404':
 *         description: Client not found, invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/notFound"
 *     security:
 *       - bearerAuth: []
 *
 */
import express from "express";
const router = express.Router();

import {
  getAllClients,
  getOneClient,
  createClient,
  deleteClient,
  editClient,
  resetPassword,
  changePassword,
  sendResetLink,
} from "../controllers/clientsController.js";

router.route("/").get(getAllClients).post(createClient);
router.route("/:id").get(getOneClient).patch(editClient).delete(deleteClient);
router.route("/pwd/:id").post(resetPassword).patch(sendResetLink).put(changePassword);

export default router;
