import express from "express";
import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import "express-async-errors";

import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import xss from "xss-clean";
import fileupload from "express-fileupload";

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

// swagger
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swaggerOptions.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

let origin = "https://bgclients.vercel.app";
if (process.env.NODE_ENV !== "production") {
  origin = "http://localhost:3000";
}

const app = express();
app.set("trust proxy", 1);

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
app.use("/docs/", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: false }));
// only when ready to deploy
app.use(express.static(path.resolve(__dirname, "./static")));
app.use(express.static(path.resolve(__dirname, "./docs/")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./static", "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app, PORT };
