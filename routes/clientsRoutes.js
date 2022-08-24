import express from "express";
const router = express.Router();

import { getAllClients, getOneClient, createClient, deleteClient, editClient, resetClient } from "../controllers/clientsController.js";

router.route("/").get(getAllClients).post(createClient);
router.route("/:id").get(getOneClient).patch(editClient).delete(deleteClient).put(resetClient);

export default router;
