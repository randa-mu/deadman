# deadman 💀

![build](https://github.com/randa-mu/deadman/actions/workflows/build.yml/badge.svg)

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

## Docker
The server application can be built and run by running `docker build .` at the project root. More details can be found in the [server README](./server/README.md).

## Roadmap
- [x] web form for partial signing
- [ ] actual encryption of ciphertexts
- [ ] link the user and ciphertext to avoid cross-decryption
- [ ] API for storage of partial signatures, and automatic aggregation
- [ ] persistent database for web API
- [ ] enable storage and retrieval of ciphertexts to/from IPFS
- [ ] enable storage and retrieval of ciphertexts and conditions to/from a blockchain