#!/bin/bash

echo "Deploying AnyGIS Mapshoter container to DockerHub"

docker build -t nnngrach/mapshoter .
docker push nnngrach/mapshoter

echo "Deploying DONE"