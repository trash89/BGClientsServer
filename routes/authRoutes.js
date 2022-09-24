/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Authenticate an user
 *     description: Authenticate an user to BGClients API REST server
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The user's ID.
 *                     email:
 *                       type: string
 *                       description: The user's email.
 *                     isAdmin:
 *                       type: boolean
 *                       description: true if the user is Admin, false otherwise.
 *                 session:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: The user's access token, for Bearer authentication.
 *                     refresh_token:
 *                       type: string
 *                       description: The refresh token
 *       '401':
 *         description: Unsuccessful operation, invalid login credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: The error message
 *                     status:
 *                       type: integer
 *                       description: The error code
 *             example:
 *               error:
 *                 message: Invalid login credentials
 *                 status: 400
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

router.route("/login").post(apiLimiter, login);

export default router;
