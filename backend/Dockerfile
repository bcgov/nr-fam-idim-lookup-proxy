# Official node, but Alphine is still considered experimental
FROM node:alpine3.16

# Set node to production 
ENV NODE_ENV production

WORKDIR /app
COPY . .
RUN npm ci --ignore-scripts
RUN npm i -g @nestjs/cli

EXPOSE 3000
USER 1001
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/api

# Start up command with 50MB of heap size, each application needs to determine what is the best value. DONT use default as it is 4GB.
ENTRYPOINT ["npm","run", "start:dev"]
