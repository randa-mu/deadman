# 1) Install all workspace deps (cached until lockfile changes)
FROM oven/bun:latest AS deps
WORKDIR /usr/src/app
COPY package.json bun.lock ./
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/
RUN bun install --frozen-lockfile --ignore-scripts

# 2) (Optional) build step for your TS / bundler artifacts
FROM deps AS build
WORKDIR /usr/src/app
COPY . .
ENV NODE_ENV=production
RUN bun build ./server/src/index.ts --compile --outfile deadman-api

# 3) Final image: pull in only what server needs
FROM debian:bookworm-slim AS release
# copy server code + any shared code it imports
COPY --from=build /usr/src/app/deadman-api /usr/bin/deadman-api

EXPOSE 3000

# use the server’s start script—adjust if yours is different
CMD ["/usr/bin/deadman-api"]
