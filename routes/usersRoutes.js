import express from "express";
const router = express.Router();

import { getAllUsers, createUser, deleteUser, editUser } from "../controllers/usersController.js";

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").patch(editUser).delete(deleteUser);

export default router;
