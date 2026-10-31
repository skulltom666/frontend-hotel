import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    viewportWidth: 1200,
    viewportHeight: 800,
    video: false
  },
});
