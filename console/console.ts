import "dotenv/config";
import repl from "repl";
import { initializeConsole } from "./init"; // Import the new initialization function

const myRepl = repl.start("> ");

initializeConsole(myRepl.context); // Initialize the REPL context
