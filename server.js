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

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

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

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BGClients Express API documented with Swagger",
      version: "0.1.0",
      description: "This is the documentation of BGClients API REST server, made with Express and Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "trash89",
        url: "https://portfoliotrash89.vercel.app/",
        email: "trash89@laposte.net",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
      },
    ],
    tags: [
      { name: "Auth", description: "BGClients server API REST Authentication" },
      { name: "Clients", description: "Operations on clients" },
      { name: "Events", description: "Operations on client's events" },
      { name: "Userfiles", description: "Operations on client's files" },
      { name: "Clientview", description: "Actions a client can request: change password, etc." },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        client: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            title: {
              type: "string",
            },
            author: {
              type: "string",
            },
          },
        },
        BasicErrorModel: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
            code: {
              type: "integer",
              minimum: 100,
              maximum: 600,
            },
          },
        },
      },
    },
  },
  apis: ["./routes/authRoutes.js", "./routes/clientsRoutes.js", "./routes/eventsRoutes.js", "./routes/userfilesRoutes.js", "./routes/clientviewRoutes.js"],
};

const specs = swaggerJsdoc(options);
console.log(specs);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: false }));

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
      console.log(`🚀 API REST Documentation is available at http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
