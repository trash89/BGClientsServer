const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
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
        //url: process.env.NODE_ENV === "production" ? `https://bgclientsserver.vercel.app/api/v1` : `http://localhost:5000/api/v1`,
        url: "/api/v1",
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
      responses: {
        BasicErrorModel: {
          type: "object",
          properties: {
            message: { type: "string" },
            code: { type: "integer", format: "int64" },
          },
        },
        authInvalid: {
          type: "object",
          properties: { msg: { type: "string" } },
        },
        badRequest: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                message: { type: "string" },
                status: { type: "integer", format: "int64" },
                msg: { type: "string" },
              },
            },
          },
        },
        notFound: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                details: { type: "string" },
                hint: { type: "string" },
                message: { type: "string" },
                msg: { type: "string" },
              },
            },
          },
        },
      },
      schemas: {
        client: {
          type: "object",
          properties: {
            id: { type: "integer", format: "int64" },
            created_at: { type: "string", format: "date" },
            localuser_id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string" },
            address: { type: "string" },
            email: { type: "string" },
            user_id: { type: "string" },
          },
        },
        createClient: {
          type: "object",
          properties: {
            email: { type: "string" },
            password: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            address: { type: "string" },
          },
        },
        event: {
          type: "object",
          properties: {
            id: { type: "integer", format: "int64" },
            client_id: { type: "integer", format: "int64" },
            ev_name: { type: "string" },
            ev_description: { type: "string" },
            ev_date: { type: "string", format: "date" },
            user_id: { type: "string" },
            displayed: { type: "boolean" },
            clients: {
              type: "object",
              properties: { name: { type: "string" } },
            },
          },
        },
        createEvent: {
          type: "object",
          properties: {
            client_id: { type: "integer" },
            ev_name: { type: "string" },
            ev_description: { type: "string" },
            ev_date: { type: "string" },
          },
        },
        userfile: {
          type: "object",
          properties: {
            id: { type: "integer", format: "int64" },
            client_id: { type: "integer", format: "int64" },
            file_name: { type: "string" },
            file_description: { type: "string" },
            user_id: { type: "string" },
            displayed: { type: "boolean" },
            clients: {
              type: "object",
              properties: {
                name: { type: "string" },
              },
            },
          },
        },
        createFile: {
          type: "object",
          properties: {
            client_id: { type: "integer" },
            file_description: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./routes/authRoutes.js", "./routes/clientsRoutes.js", "./routes/eventsRoutes.js", "./routes/userfilesRoutes.js", "./routes/clientviewRoutes.js"],
};

export default swaggerOptions;
