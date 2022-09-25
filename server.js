import { app, PORT, SERVER } from "./app.js";

const start = async () => {
  try {
    app.listen(PORT, SERVER, () => {
      console.log(`🚀 Server is listening on ${SERVER}`);
      console.log(`🚀 API REST Documentation is available at ${SERVER}/docs`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
