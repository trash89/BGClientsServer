/**
 * @swagger
 * /events:
 *   get:
 *     tags:
 *       - Events
 *     summary: Retrieve the list of events
 *     description: Retrieve the list of events.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags:
 *       - Events
 *     summary: Create a new event for a client.
 *     description: Create a new event for a client.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 * /events/{id}:
 *   get:
 *     tags:
 *       - Events
 *     summary: Retrieve the list of events
 *     description: Retrieve the list of events.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags:
 *       - Events
 *     summary: Create a new event for a client.
 *     description: Create a new event for a client.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Events
 *     summary: Create a new event for a client.
 *     description: Create a new event for a client.
 *     responses:
 *       '200':
 *         description: Successful operation
 *     security:
 *       - bearerAuth: []
 *
 */

import express from "express";
const router = express.Router();

import { getAllEvents, getOneEvent, createEvent, editEvent, deleteEvent } from "../controllers/eventsController.js";

router.route("/").get(getAllEvents).post(createEvent);
router.route("/:id").get(getOneEvent).patch(editEvent).delete(deleteEvent);

export default router;
