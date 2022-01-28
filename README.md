# Wildlife Licencing Services

#### For Natural England

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_wildlife-licencing&metric=alert_status)](https://sonarcloud.io/dashboard?id=DEFRA_wildlife-licencing)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_wildlife-licencing&metric=ncloc)](https://sonarcloud.io/dashboard?id=DEFRA_wildlife-licencing)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_wildlife-licencing&metric=coverage)](https://sonarcloud.io/dashboard?id=DEFRA_wildlife-licencing)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_wildlife-licencing&metric=bugs)](https://sonarcloud.io/dashboard?id=DEFRA_wildlife-licencing)

## Getting started

### To run the application as a docker swarm

First edit the docker secret environment files to add the secret keys

- docker/env/aqp-secrets.env

(The secrets for the test environment may be obtained from <TBC - graham.willis@defra.gov.uk>)

Now run the following shell commands;

```shell
cd  wildlife-licencing
npm run docker:build
npm run docker:start
docker service ls
npm run docker:stop
```

- http://localhost:3000/openapi-ui
- http://localhost:4000/hello

The docker services running should be as follows:

- wls_adminer
- wls_db
- wls_localstack
- wls_redis
- wls_redis_commander
- wls_api
- wls_aqp

### To run locally

To run the microservices locally you need to start the supporting cloud services in the docker swarm.

Run the following shell commands;

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

Ensure you have node version 16.13.0 or greater installed; `node --version`

#### Start the API locally

```shell
cd wildlife-licencing/packages/api
cp env.example .env
node -r dotenv/config src/api-service.js
```

#### To start the queue processor locally

```shell
cd wildlife-licencing/packages/application-queue-processor
cp env.example .env
node -r dotenv/config src/application-queue-processor.js
```

Edit the .env files to add secrets

(The secrets for the test environment may be obtained from <TBC - graham.willis@defra.gov.uk>)

Alternatively set the environment variables in the running shell or your IDE

## Packages

| Package | Description | Runnable | Docker Image |
| ----------- | ----------- | ----------- | ----------- |
| [api](packages/api) | The application program interface to support the UI and manage data transfers from the middleware to Power Apps | Y | wildlife-licencing/api |
| [application-queue-processor](packages/application-queue-processor) | Consumes jobs from the application-queue and submits them to Power Apps as ODATA batch updates. | Y | wildlife-licencing/aqp | 
| [application-extract-processor](packages/application-extract-processor) | Extracts data application data from Power Apps and updates the postgres database | Y | wildlife-licencing/ep | 
| [refdata-extract-processor](packages/refdata-extract-processor) | Extracts reference data from Power Apps and updates the postgres database | Y | wildlife-licencing/ep | 
| [web-service](packages/eps/web-service) | Public facing web server | Y | wildlife-licencing/eps-web |
| [connectors-lib](packages/connectors-lib) | Encapsulates connector logic. Currently supports AWS, Postgres, Redis, Power Apps & Bull-Queue | N | 
| [database-model](packages/database-model) | Extracts the sequelize database model in order to share it between multiple processes | N | 
| [powerapps-lib](packages/powerapps-lib) | Supports operations against the Power Apps ODATA interface including transformation | N | 
| [queue-defs](packages/queue-defs) | Extracts the bull-queue queue definitions | N | 

## Description of API Process

### API to Power Apps

A set of API handlers has been created for the manipulation of the application data in the POSTGRES database. These are
documented via OpenAPI at `http://localhost:3000/openapi-ui` when running locally.

Requests to the API will create an entry in the applications table and populate the JSON structure in the application
JSONB field. Each application is associated with a user which is recorded in the users table.

On submission of the application via API application/submit request the following will occur:

(1) The data will be queued using bull-queue and a 204 no-content returned by the API. The queues are stored in Redis
and can be inspected (locally) using redis-commander `http://localhost:8002/`

The queues are defined centrally in the package ```packages/queue-defs/src/defs.js```. This enables autonomous processes
that connect to the queues on start-up to ensure they have the same definition.

(2) The queued data is consumed by the application-queue-processor.

The `packages/application-queue-processor/src/application-job-process.js` method in application-queue-processor reads
the application data from the database and uses and calls the batchUpdate method
in `powerapps-lib/src/application-update/batch-update.js`. The job is removed from the queue.

On success this will return a set of keys from Power Apps which are stored in the applications table in the target_keys column. In subsequent calls to submit these keys are used to effect an update of the data in Power Apps.

The batchUpdate method may throw a recoverable or un-recoverable error.

On recoverable errors the batchUpdate method will return Promise.Reject that the queue mechanism will retry according to
the retry configuration in queue-defs.

On un-recoverable errors the batchUpdate method will return Promise.Resolve and log an error for investigation.

(3) In the powerapps-lib the application data is transformed using the model defined
in `packages/powerapps-lib/src/model/sdds-applications.js`. This is a JSON object representing the target schema, into which a path element is used to map the data to the API/database structure.

(4) The createBatchRequestBody in `packages/powerapps-lib/src/application-update/batch-formation.js` builds a ODATA batch request which ensures that the insert update transactions fail or succeed as a group. It also determines whether to POST or PATCH each element based on the existence of key data.

(5) The powerapps-lib calls batchRequest method in `packages/connectors-lib/src/power-apps.js` to handle the low level

request. This deals for authorisation and token management.

### Power Apps to API

