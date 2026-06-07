import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "lifeos-backend", // Replace with your actual Trigger.dev project ID
  runtime: "node",
  logLevel: "log",
  // Set the maximum duration a task can run (e.g. 1 hour)
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["src/trigger"],
});
