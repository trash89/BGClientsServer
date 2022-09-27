/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authenticate on BGClients API REST server
 *     description: Authenticate the user to BGClients API REST server
 *     operationId: login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               email
 *               password
 *             example:
 *               email: demo@demo.com
 *               password: secret123
 *     responses:
 *       '200':
 *         description: Successful operation, user authenticated
 *       '401':
 *         description: Unsuccessful operation, invalid login credentials
 *
 */

import express from "express";
const router = express.Router();

import rateLimiter from "express-rate-limit";
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

import { login } from "../controllers/authController.js";

//router.route("/login").post(apiLimiter, login);
router.route("/login").post(login);

export default router;
