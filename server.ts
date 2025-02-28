import express from "express";
import next from "next";
import path from "path";

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
      maxAge: dev ? "0" : "1y",
    })
  );

  // Let Next.js handle all other routes
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
