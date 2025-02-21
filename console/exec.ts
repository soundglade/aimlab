// @ts-nocheck
import "dotenv/config";
import { initializeConsole } from "./init"; // Import the initialization function

function ev(prom) {
  prom.then(
    (result) => {
      console.log(result);
      process.exit(0); // Exit successfully
    },
    (e) => {
      console.error(e);
      console.error(JSON.stringify(e, null, 2));
      process.exit(1); // Exit with error
    }
  );
}

initializeConsole(global); // Initialize the global context

eval(`
    let main = async () => {
      return ${process.argv[2]}
    }

    ev(main())
`);
