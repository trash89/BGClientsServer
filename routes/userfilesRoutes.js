/**
 * @swagger
 * /userfiles:
 *   get:
 *     tags:
 *       - Userfiles
 *     summary: Retrieve the list of files.
 *     description: Retrieve the list of files.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags:
 *       - Userfiles
 *     summary: Create a new file for a client
 *     description: Create a new file for a client.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 * /userfiles/{id}:
 *   get:
 *     tags:
 *       - Userfiles
 *     summary: Retrieve the list of files.
 *     description: Retrieve the list of files.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags:
 *       - Userfiles
 *     summary: Create a new file for a client
 *     description: Create a new file for a client.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Userfiles
 *     summary: Create a new file for a client
 *     description: Create a new file for a client.
 *     responses:
 *       '200':
 *         description: Successful operation
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
