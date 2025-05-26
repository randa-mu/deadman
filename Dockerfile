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
RUN bun run build

# 3) Final image: pull in only what server needs
FROM oven/bun:latest AS release
WORKDIR /usr/src/app

# pull in installed modules (all workspaces)
COPY --from=deps /usr/src/app/node_modules ./node_modules

# copy server code + any shared code it imports
COPY --from=build /usr/src/app/server ./server
COPY --from=build /usr/src/app/shared ./shared

WORKDIR /usr/src/app/server
ENV NODE_ENV=production
EXPOSE 3000

# use the server’s start script—adjust if yours is different
CMD ["bun", "run", "start"]
