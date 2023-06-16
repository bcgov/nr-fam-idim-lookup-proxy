FROM node:18-bullseye-slim AS build
ENV NODE_ENV production

# Install
WORKDIR /app
COPY *.json ./
COPY ./src /app/src
USER root
RUN npm ci --ignore-scripts
RUN npm run build

# Expose and health check
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/api

# Start up command with 50MB of heap size, each application needs to determine what is the best value. DONT use default as it is 4GB.
USER appuser
ENTRYPOINT ["node","--max-old-space-size=50", "/app/dist/main"]
