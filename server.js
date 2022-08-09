import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import morgan from "morgan";

import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

import helmet from "helmet";
import xss from "xss-clean";
import cookieParser from "cookie-parser";

// routers
import authRouter from "./routes/authRoutes.js";
import usersRouter from "./routes/usersRoutes.js";

// middleware
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import authenticateUser from "./middleware/auth.js";

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// only when ready to deploy
// app.use(express.static(path.resolve(__dirname, './client/build')))

app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authenticateUser, usersRouter);

app.get("/", (req, res) => {
  res.send("<body><div><strong>BGClients API REST server</strong></div><div>Please authenticate first on /api/v1/auth/login !</div></body>");
});

// only when ready to deploy
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
// })

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
