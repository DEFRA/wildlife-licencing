########################################################################################
# Create a docker image for the wildlife licencing queue processor
########################################################################################
FROM node:16.13.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm ci
CMD [ "node", "src/application-queue-processor.js" ]