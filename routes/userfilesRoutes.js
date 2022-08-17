import express from "express";
const router = express.Router();

import { getAllFiles, getOneFile, createFile, editFile, deleteFile } from "../controllers/userfilesController.js";

router.route("/").get(getAllFiles).post(createFile);
router.route("/:id").get(getOneFile).patch(editFile).delete(deleteFile);

export default router;
