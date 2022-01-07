# Wildlife Licencing Services

#### For Natural England

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_rod-licensing&metric=alert_status)](https://sonarcloud.io/dashboard?id=DEFRA_rod-licensing)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_rod-licensing&metric=ncloc)](https://sonarcloud.io/dashboard?id=DEFRA_rod-licensing)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_rod-licensing&metric=coverage)](https://sonarcloud.io/dashboard?id=DEFRA_rod-licensing)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_rod-licensing&metric=bugs)](https://sonarcloud.io/dashboard?id=DEFRA_rod-licensing)

## Getting started
```shell
cd  wildlife-licencing
npm run docker:build
npm run docker:start
docker service ls
npm run docker:stop
```
- http://localhost:3000/openapi-ui
- http://localhost:4000/hello

## To run locally
To run the microservices locally you need to start the supporting cloud services in the docker swarm
```shell
cd  wildlife-licencing
npm run docker:start-cloud
docker service ls
```
The docker services running should be as follows:
- wls_adminer
- wls_db
- wls_localstack
- wls_redis
- wls_redis_commander

### To start the API locally
```shell
cd wildlife-licencing/packages/api
cp env.example .env
node -r dotenv/config src/api-service.js
```

### To start the queue processor locally
```shell
cd wildlife-licencing/packages/application-queue-processor
cp env.example .env
node -r dotenv/config src/application-queue-processor.js
```

Alternatively set the environment variables in the running shell or your IDE

