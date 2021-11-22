########################################################################################
# Create a docker image for the wildlife licencing EPS API service
########################################################################################
FROM node:16.13.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD [ "node", "src/eps-api-service.spec.js" ]