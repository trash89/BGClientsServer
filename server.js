import { app, PORT } from "./app.js";

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
