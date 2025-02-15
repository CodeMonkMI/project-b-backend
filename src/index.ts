import http from "http";
import "reflect-metadata";

import { createApp } from "./app";
import { resolveDependencies } from "./lib/registry";

let server: http.Server;
const PORT = process.env.PORT || 9000;
async function main() {
  try {
    await resolveDependencies();

    const app = createApp();

    server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    console.log("Failed to start server");
    process.exit(1);
  }
}

main();
