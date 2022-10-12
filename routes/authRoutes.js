/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate an user on the REST API server
 *     description: Authenticate an user on the REST API server.Returns a Bearer token
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

if (process.env.NODE_ENV === "development") {
  router.route("/login").post(login);
} else {
  router.route("/login").post(apiLimiter, login);
}

export default router;
