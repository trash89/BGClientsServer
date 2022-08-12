import express from "express";
const router = express.Router();

import { getAllEvents, getOneEvent, createEvent, editEvent, deleteEvent } from "../controllers/eventsController.js";

router.route("/").get(getAllEvents).post(createEvent);
router.route("/:id").get(getOneEvent).patch(editEvent).delete(deleteEvent);

export default router;
