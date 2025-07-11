// Minimal Workers-compatible entry point for testing
// This file should be safe to import in any environment

export const WorkersSafeApp = () => {
  return {
    name: "rebookedsolutions",
    version: "1.0.0",
    environment: "workers",
  };
};

export default WorkersSafeApp;
