import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
    env: { BACKEND: "http://localhost:5000/api/v1" },
    video: false,
    videoUploadOnPasses: false,
    screenshotOnRunFailure: false,
    experimentalStudio: true,
  },
});
