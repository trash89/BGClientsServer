import express from "express";
const router = express.Router();

import { getAllUsers } from "../controllers/usersController.js";

router.route("/").get(getAllUsers);

export default router;
