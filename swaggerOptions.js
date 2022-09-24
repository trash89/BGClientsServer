const PORT = process.env.PORT || 5000;

const swaggerOptions = {
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

export default swaggerOptions;
