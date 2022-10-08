import { app, PORT } from "./app.js";
let SERVER = `localhost`;
if (process.env.NODE_ENV === "production") SERVER = `bgclientsserver.vercel.app`;

/**
 * Starts the express server
 *
 */
const start = async () => {
  try {
    app.listen(PORT, SERVER, () => {
      console.log(`🚀 Server is listening on http://${SERVER}:${PORT}`);
      console.log(`🚀 REST API Documentation is available at http://${SERVER}:${PORT}/docs`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
