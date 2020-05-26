#!/bin/bash

echo "Deploying AnyGIS Mapshoter container to DockerHub"

# To aviod x64 / x86 versions of Sharp image library conflict
# i just removed it's folder before creating container.
# This'll be dowlnloaded whith server 'docker pull  &&  docker run' command.
rm -rf node_modules/sharp

docker build -t nnngrach/mapshoter .
docker push nnngrach/mapshoter

echo "Deploying DONE"