import { app, PORT } from "./app.js";

let SERVER = `localhost`;
if (process.env.NODE_ENV === "production") SERVER = `bgclientsserver.vercel.app`;

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
