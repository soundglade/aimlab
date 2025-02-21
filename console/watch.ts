import { spawn } from "child_process";
import chokidar from "chokidar";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.resolve(__dirname, "console.ts");
const watchPath = path.resolve(__dirname, "..", "src/");

let child;
let restartTimeout;

const startRepl = () => {
  if (child) {
    child.kill();
  }
  child = spawn("tsx", [scriptPath], { stdio: "inherit" });

  child.on("close", (code) => {
    if (code !== null) {
      console.log(`REPL exited with code ${code}`);
    }
  });
};

const scheduleRestart = () => {
  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }
  restartTimeout = setTimeout(() => {
    console.log("Restarting REPL...");
    startRepl();
  }, 100); // Debounce delay (100ms)
};

chokidar
  .watch(watchPath, { ignored: /node_modules/ })
  .on("all", (event, path) => {
    scheduleRestart();
  });

// Start the REPL for the first time
startRepl();
