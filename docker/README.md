# Docker setup

There are two distinct uses for the docker configuration in the project, firstly to provide a means of running the entire application on a local docker swarm, and secondly to build the set of images which are deployed into ECS.

## The local docker swarm 
The local docker swarm makes use of docker-compose to build a set of images which make up the service. Each image is defined by the Dockerfile.dev file in the root of the packages in the mono-repo. These files are:

- The API: ```packages/api/Dockerfile.dev```
- The Application Extract Processor: ```packages/aep/Dockerfile.dev```
- The Application Queue Processor: ```packages/aqp/Dockerfile.dev```
- The File Queue Processor: ```packages/fqp/Dockerfile.dev```
- The Reference Data Extract Processor: ```packages/rep/Dockerfile.dev```
- The Web-service: ```packages/web-service/Dockerfile.dev```

The simplest way to build the images is to run docker-compose from the root of the project:
```docker-compose -f docker/services.build.yml build```

This will create the set of development images in the local image repository;
```shell
wildlife-licencing/aqp
wildlife-licencing/fqp  
wildlife-licencing/api 
wildlife-licencing/web 
wildlife-licencing/rep 
wildlife-licencing/aep
```
The swarm deployment uses the set of environment files located at `docker/env`. The files are made up of some standard environment parameters `*.env` and secrets `*-secrets.env`. The secrets must be populated manually before running the deployment and care should be taken not to check these secret files into github.

The local swarm requires a set of supporting cloud services to run, these images can be deployed into the stack wls, along with the service images with;

```shell
docker stack deploy -c docker/cloud-services.yml wls
docker stack deploy -c docker/services.yml wls
```

### Steps to the images build manually 

It may be occasionally useful to test the production images in the local swarm.

To build using the multi-stage image creation create the production images as described here

1. Build the base and builder packages which are used in the staged build
``` shell
docker build -t wildlife_licensing/base -f Dockerfile.base .
docker build -t wildlife_licensing/builder -f Dockerfile.build .
 ```

2. Build the production images
```shell
docker build -t wildlife-licencing/api:latest --file ./packages/api/Dockerfile.prod ./packages/api
docker build -t wildlife-licencing/aqp:latest --file ./packages/application-queue-processor/Dockerfile.prod ./packages/application-queue-processor
docker build -t wildlife-licencing/fqp:latest --file ./packages/file-queue-processor/Dockerfile.prod ./packages/file-queue-processor
docker build -t wildlife-licencing/aep:latest --file ./packages/application-extract-processor/Dockerfile.prod ./packages/application-extract-processor
docker build -t wildlife-licencing/rep:latest --file ./packages/refdata-extract-processor/Dockerfile.prod ./packages/refdata-extract-processor
docker build -t wildlife-licencing/web:latest --file ./packages/web-service/Dockerfile.prod ./packages/web-service
```

The production images can be used in the local swarm by running the deployment as above.

### Liquibase

The liquibase container can be used to create database migrations, which is necessary in the live environment where tables cannot be dropped.  

The change-log files (packages/database-model/liquibase/changelog/*.xml) are copied into the container when it is built
```docker build -t wildlife-licencing/liquibase:latest --file ./docker/liquibase/Dockerfile.prod .```

The liquibase container is intended to be run from the Jenkins pipelines 

For development purposes it can then be run on the command line as follows
```docker run wildlife-licencing/liquibase update --url="jdbc:postgresql://host.docker.internal:5432/wls" --changeLogFile="./db.changelog-root.xml" --username=wlsuser --password=wildl1fe```

To invoke liquibase within the running container log on to the running container and issue the update command:
```shell
docker run wildlife-licencing/liquibase tail -f /dev/null
docker exec -t $(docker ps | grep wildlife-licencing/liquibase | awk  '{print $1}') /bin/bash
liquibase update --changelog-file ./changelog/db.changelog-root.xml --url="jdbc:postgresql://host.docker.internal:5432/wls" --username=wlsuser --password=:pw
```
