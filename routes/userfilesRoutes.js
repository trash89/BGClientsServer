/**
 * @swagger
 * /userfiles:
 *   get:
 *     tags:
 *       - Userfiles
 *     summary: Retrieve the list of userfiles
 *     description: Retrieve the list of userfiles
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '400':
 *         description: Unsuccessful operation
 *       '401':
 *         description: Authentication invalid
 *     security:
 *       - bearerAuth: []
 *
 *   post:
 *     tags:
 *       - Userfiles
 *     summary: Create a new file for a client
 *     description: Create a new file for a client
 *     operationId: createFile
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: integer
 *               file_description:
 *                 type: string
 *               filename:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successful operation, file created
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Authentication invalid
 *     security:
 *       - bearerAuth: []
 *
 * /userfiles/{id}:
 *   get:
 *     tags:
 *       - Userfiles
 *     summary: Retrieve the details for one file
 *     description: Retrieve the details for one file
 *     operationId: getOneFile
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: File ID
 *         example:
 *           41
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Authentication invalid
 *       '404':
 *         description: File not found, invalid ID
 *     security:
 *       - bearerAuth: []
 *
 *   patch:
 *     tags:
 *       - Userfiles
 *     summary: Edit one file
 *     description: Edit one file
 *     operationId: editFile
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: File ID
 *         example:
 *           41
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               client_id:
 *                 type: integer
 *               file_description:
 *                 type: string
 *               displayed:
 *                 type: boolean
 *               filename:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successful operation, file updated
 *       '401':
 *         description: Authentication invalid
 *       '404':
 *         description: File not found, invalid ID
 *     security:
 *       - bearerAuth: []
 *
 *   delete:
 *     tags:
 *       - Userfiles
 *     summary: Delete a file for a client
 *     description: Delete a file for a client
 *     operationId: deleteFile
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: File ID
 *         example:
 *           41
 *     responses:
 *       '200':
 *         description: Successful operation, file deleted
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Authentication invalid
 *       '404':
 *         description: File not found, invalid ID
 *     security:
 *       - bearerAuth: []
 *
 */

import express from "express";
const router = express.Router();

import { getAllFiles, getOneFile, createFile, editFile, deleteFile } from "../controllers/userfilesController.js";

router.route("/").get(getAllFiles).post(createFile);
router.route("/:id").get(getOneFile).patch(editFile).delete(deleteFile);

export default router;
