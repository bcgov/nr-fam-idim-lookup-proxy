FROM node:18-bullseye-slim AS build

# Install
WORKDIR /app
COPY *.json ./
COPY ./src /app/src
RUN npm ci --ignore-scripts
RUN npm run build

# Deployment container
FROM gcr.io/distroless/nodejs:18
ENV NODE_ENV production

# Copy over app
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Expose and health check
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/api

# Non-privileged user
USER app

# Start up command with 50MB of heap size, each application needs to determine what is the best value. DONT use default as it is 4GB.
ENTRYPOINT ["node","--max-old-space-size=50", "/app/dist/main"]
