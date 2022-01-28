########################################################################################
# Create a docker image for the wildlife licencing queue processor
########################################################################################
FROM node:16.13.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
