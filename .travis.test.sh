#!/bin/bash
if [[ $TRAVIS_COMMIT_MESSAGE == *"[skip test]"* ]] || [[ -n "$TRAVIS_TAG" ]]
then
	echo "Skipping test stage"
else
	source .travis.env.sh
	docker build -f Dockerfile.test -t weacast/weacast-grib2json:test .
	docker run --rm -v ./coverage:/tmp/weacast-grib2json/coverage weacast/weacast-grib2json:test
fi
