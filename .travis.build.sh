#!/bin/bash
source .travis.env.sh

docker build -t weacast/weacast-grib2json .
docker login -u="$DOCKER_USER" -p="$DOCKER_PASSWORD"

# Build docker with version number only on release
if [[ -z "$TRAVIS_TAG" ]]
then
	docker push weacast/weacast-grib2json
else
	docker push weacast/weacast-grib2json
	docker tag weacast/weacast-grib2json weacast/weacast-grib2json:$VERSION
	docker push weacast/weacast-grib2json:$VERSION
fi
