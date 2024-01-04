docker build -t wildlife_licensing/base -f Dockerfile.base .
docker build -t wildlife_licensing/builder -f Dockerfile.build .

SERVICE_NAME=new_api
DOCKER_FILE=packages/api/Dockerfile.dev
CONTEXT=packages/api
#IMAGE_NAME="natural_england_wildlife/${SERVICE_NAME}"
IMAGE_NAME="wildlife-licencing/api"
git_image_tag='test-ci'

docker build -t "${IMAGE_NAME}:${git_image_tag}" --file ${DOCKER_FILE} ${CONTEXT}


#docker rm -f wls_api
#
#docker run -p 3000:3000 --network='host' -e "POSTGRES_HOST=host.docker.internal" -e "REDIS_HOST=host.docker.internal" --name wls_api natural_england_wildlife/new_api:test-ci


# docker rm -f wls_api && docker run -it --name wls_api natural_england_wildlife/new_api:test-ci /bin/sh

#  docker rm -f wls_api && docker run -p 3000:3000 -e "DATABASE_HOST=host.docker.internal" --name wls_api natural_england_wildlife/new_api:test-ci
