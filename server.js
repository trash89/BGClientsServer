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
import cookieParser from "cookie-parser";

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

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// only when ready to deploy
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.set("trust proxy", 1);

let origin = "https://bgclients.herokuapp.com";
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
app.options(
  "*",
  cors({
    origin: [origin],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS", "HEAD", "CONNECT", "TRACE"],
  })
);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, UPDATE, PUT, PATCH, OPTIONS, HEAD, CONNECT, TRACE");
  res.header("Allow", "GET, POST, DELETE, UPDATE, PUT, PATCH, OPTIONS, HEAD, CONNECT, TRACE");
  next();
});
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(fileupload());
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/clients", authenticateUser, clientsRouter);
app.use("/api/v1/events", authenticateUser, eventsRouter);
app.use("/api/v1/userfiles", authenticateUser, userfilesRouter);
app.use("/api/v1/clientview", authenticateUser, clientviewRouter);

// only when ready to deploy
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

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
