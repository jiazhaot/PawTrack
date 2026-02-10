#!/bin/bash
set -e
cd ..
make clean
ENV=$1
if [ "$ENV" == "testing" ]; then
	make cross
elif [ "$ENV" == "prerelease" ]; then
	make prerelease
elif [ "$ENV" == "production" ]; then
    make production
else
	make built
fi
