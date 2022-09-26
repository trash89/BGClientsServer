import { app, PORT, SERVER } from "./app.js";

const start = async () => {
  try {
    app.listen(PORT, SERVER, () => {
      console.log(`🚀 Server is listening on http://${SERVER}:${PORT}`);
      console.log(`🚀 API REST Documentation is available at http://${SERVER}:${PORT}/docs`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
