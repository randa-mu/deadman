# deadman 💀

A web app for creating a deadman's switch. 
Input content to be encrypted, choose your committee of keyholders, select the conditions your keyholders should activate the switch, and download their keyshares and ciphertext for distribution.

## Modules
- [client](./client)

Web frontend using vite, react, tailwind and shadcn

- [server](./server)

A web API for (optionally) storing ciphertexts and partial signatures for future decryption.

- [shared](./shared)

Typescript shared modules for usage between front and backend

## Quickstart
- install [bun](https://bun.sh/)
- install dependencies with `bun install`
- run the frontend and API together by running `bun dev`
