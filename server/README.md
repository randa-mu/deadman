# server

## Quickstart
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000

## Configuration
The following env vars are supported:

- PORT
sets the port the HTTP server runs on

- DEADMAN_STATE_FILE
the file to store sqlite state to

## Docker
The app runs in docker by building the [Dockerfile](../Dockerfile) at the root of the project