import express from "express";
const router = express.Router();

import { getAllClients, getOneClient, createClient, deleteClient, editClient } from "../controllers/clientsController.js";

router.route("/").get(getAllClients).post(createClient);
router.route("/:id").get(getOneClient).patch(editClient).delete(deleteClient);

export default router;
