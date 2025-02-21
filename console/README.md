# Console

The Console is a development tool that provides a REPL (Read-Eval-Print Loop) environment for interacting with libraries and utilities. It's designed to help developers test, debug, and experiment with various components of the system.

## Usage

There are two ways to use the console:

### Interactive Console

```bash
npm run console
```

This command launches a full REPL environment where you can interactively work with libraries and utilities. The console maintains its state throughout your session and it automatically reloads when you make changes to the code.

### Single Command Execution

```bash
npm run exec <command>
```

This mode runs a single command in the same environment as the console but exits immediately after execution. It's useful for quick operations or when you want to integrate console commands into scripts.

## Utils

Beyond the code libaries, the console provides some extra utilities that are useful for quick debugging.

### loadScriptSample

Loads a meditation script sample.

```ts
const sample = loadScriptSample("busy-professional-01");
```
