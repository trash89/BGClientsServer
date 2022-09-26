/**
 * @swagger
 * /events:
 *   get:
 *     tags:
 *       - Events
 *     summary: Retrieve the list of events
 *     description: Retrieve the list of events
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
 *       - Events
 *     summary: Create a new event for a client
 *     description: Create a new event for a client
 *     operationId: createEvent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/createEvent"
 *           required:
 *             client_id
 *             ev_name
 *             ev_description
 *             ev_date
 *           example:
 *             client_id: 101
 *             ev_name: event demo1
 *             ev_description: event description demo1
 *             ev_date: 2022-08-27
 *     responses:
 *       '200':
 *         description: Successful operation, event created
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Authentication invalid
 *     security:
 *       - bearerAuth: []
 *
 * /events/{id}:
 *   get:
 *     tags:
 *       - Events
 *     summary: Retrieve the details for one event
 *     description: Retrieve the details for one event
 *     operationId: getOneEvent
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Event ID
 *         example:
 *           23
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Authentication invalid
 *       '404':
 *         description: Event not found, invalid ID
 *     security:
 *       - bearerAuth: []
 *
 *   patch:
 *     tags:
 *       - Events
 *     summary: Edit an event
 *     description: Edit an event
 *     operationId: editEvent
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Event ID
 *         example:
 *           20
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/event"
 *           example:
 *             id: 20
 *             client_id: 93
 *             ev_name: ev 1
 *             ev_description: event1 test
 *             ev_date: 2022-08-27
 *             user_id: b894d684-0896-4445-a075-28eef2e4e136
 *             displayed: true
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '401':
 *         description: Authentication invalid
 *       '404':
 *         description: Event not found, invalid ID
 *     security:
 *       - bearerAuth: []
 *
 *   delete:
 *     tags:
 *       - Events
 *     summary: Delete an event for a client
 *     description: Delete an event for a client
 *     operationId: deleteEvent
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Event ID
 *         example:
 *           20
 *     responses:
 *       '200':
 *         description: Successful operation, client deleted
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Authentication invalid
 *       '404':
 *         description: Event not found, invalid ID
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
