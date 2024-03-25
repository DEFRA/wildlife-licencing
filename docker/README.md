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

### Building a ClamAV Docker image for arm64 architectures (M1 Macbooks)
ClamAV do not currently host an ARM64 based image on Docker hub, so in order to run clamav locally in a docker container on an Apple M1 or M2 Macbook, you will need to build it yourself. The original documentation on how to do this is a bit vague (https://docs.clamav.net/manual/Installing/Docker.html#building-the-clamav-image), but carefully following the steps below will hopefully simplify the process.

We are going to need to clone two repositories from Github. This guide will assume you are cloning these two repositories inside the same directory

Clone the main ClamAV repo locally and then jump into that directory...
```
git clone git@github.com:Cisco-Talos/clamav.git
cd clamav
```

Checkout the 1.1 release branch. At the time of writing this it is currently the latest release of ClamAV that their team has pushed to Docker Hub. We need to ensure the version matches the version of the ClamAV alpine docker file we will be using to build the image...
```
git checkout rel/1.1
```
Now we'll cd back out of the clamav directory and then clone the `clamav-docker` repository...

```
cd ..
git clone git@github.com:Cisco-Talos/clamav-docker.git
```
Next, assuming we're on the `main` branch of the repo, cd into the 1.1 version of the alpine docker image setup directory and view its contents...
```
cd clamav-docker/clamav/1.1/alpine
ls
```
You should see the following files and directories:
- Dockerfile
- Jenkinsfile
- scripts/

Copy the `Dockerfile` file and the `scripts` directory into the root of the `clamav` repository we cloned earlier.
```
cp ./Dockerfile ../../../../clamav/
cp -R ./scripts ../../../../clamav/
```
Now cd into that directory we just copied to...
```
cd ../../../../clamav/
```
And do a docker build, giving it a tag and label, eg `clamav-arm64:latest` to differentiate it from any others ...
```
docker build --tag "clamav-arm64:latest" .
```
This will then build ClamAV inside a Docker image using the arm64 architecture by default on an M1 or M2 Macbook. This process does take a little while to complete.

To view the image run... 
```
docker images
``` 


To create a container running ClamAV run the following docker command:

```
docker run -d -it -p 3310:3310 --rm --name "clamav-arm64" clamav-arm64:latest
```
Then run

```
docker ps
```

You should then see the container running like this...

| CONTAINER ID | IMAGE | COMMAND | CREATED | STATUS | PORTS | NAMES |
| - | - | - | - | - | - | - |
| 9b419fd8d9a4 | clamav-arm64:latest | "/init" | About a minute ago | Up About a minute (healthy) | 0.0.0.0:3310->3310/tcp, 7357/tcp | clamav-arm64 |
