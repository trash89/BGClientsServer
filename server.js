import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import "express-async-errors";
import morgan from "morgan";
import bodyParser from "body-parser";
import fileupload from "express-fileupload";

import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

import helmet from "helmet";
import xss from "xss-clean";

// routers
import authRouter from "./routes/authRoutes.js";
import clientsRouter from "./routes/clientsRoutes.js";
import eventsRouter from "./routes/eventsRoutes.js";
import userfilesRouter from "./routes/userfilesRoutes.js";
import clientviewRouter from "./routes/clientviewRoutes.js";

// middleware
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import authenticateUser from "./middleware/auth.js";

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// only when ready to deploy
app.use(express.static(path.resolve(__dirname, "./static")));

app.set("trust proxy", 1);

let origin = "https://bgclients.vercel.app";
if (process.env.NODE_ENV !== "production") {
  origin = "http://localhost:3000";
}

app.use(
  cors({
    origin: [origin],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS", "HEAD", "CONNECT", "TRACE"],
  })
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(fileupload());
app.use(express.json());
app.use(helmet());
app.use(xss());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/clients", authenticateUser, clientsRouter);
app.use("/api/v1/events", authenticateUser, eventsRouter);
app.use("/api/v1/userfiles", authenticateUser, userfilesRouter);
app.use("/api/v1/clientview", authenticateUser, clientviewRouter);

// only when ready to deploy
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./static", "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
