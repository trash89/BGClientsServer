import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: { BACKEND: "http://localhost:5000/api/v1" },
  },
});
