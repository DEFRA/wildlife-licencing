########################################################################################
# Create a docker image for the wildlife licencing EPS WEB service
########################################################################################
FROM node:16.13.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm ci --only=production
EXPOSE 4000
CMD [ "node", "src/web-service.js" ]