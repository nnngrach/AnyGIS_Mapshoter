#!/bin/bash

echo "Deploying AnyGIS Mapshoter container to DockerHub"

# ? maybe delete Sharp folder ?

docker build -t nnngrach/mapshoter .
docker push nnngrach/mapshoter

echo "Deploying DONE"