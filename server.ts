import express from "express";
import next from "next";
import path from "path";

const FORCE_CACHE = true;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  // Serve static files from the public directory
  server.use(
    express.static(path.join(process.cwd(), "public"), {
      // Don't cache files in development
      maxAge: FORCE_CACHE ? "1y" : dev ? "0" : "1y",
    })
  );

  // Let Next.js handle all other routes
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const http = require("http");
  const httpServer = http.createServer(server);

  // Disable keep-alive and headers timeout (set to 0 for no timeout)
  httpServer.keepAliveTimeout = 0;
  httpServer.headersTimeout = 0;

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
