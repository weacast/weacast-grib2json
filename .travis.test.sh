#!/bin/bash
if [[ $TRAVIS_COMMIT_MESSAGE == *"[skip test]"* ]] || [[ -n "$TRAVIS_TAG" ]]
then
	echo "Skipping test stage"
else
	source .travis.env.sh
	docker run --rm -v $PWD/coverage:/tmp/weacast-grib2json/coverage weacast/weacast-grib2json npm test
fi
