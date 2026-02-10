set -e
cd ..
ENV=$1
# if [ $ENV == "testing" ]; then
# 	APPNAME=pawtracktest
# 	tar -cvzf release/$APPNAME.tar.gz ./release/*
# 	#scp release/$APPNAME.tar.gz root@47.113.97.153:/yn/app
# 	scp release/$APPNAME.tar.gz billy@34.125.200.81:/yn/app
# elif [ $ENV == "prerelease" ]; then
# 	APPNAME=pawtrackpre
# 	tar -cvzf release/$APPNAME.tar.gz ./release/*
# 	scp release/$APPNAME.tar.gz root@45.32.10.13:/app
# 	scp configs/config-prerelease.yaml root@45.32.10.13:/app/configs/config.yaml
# 	scp -r configs/templates/ root@45.32.10.13:/app/configs/templates/
# elif [ $ENV == "production" ]; then
if [ $ENV == "production" ]; then
	APPNAME=pawtrack
	tar -cvzf release/$APPNAME.tar.gz ./release/*
	scp release/$APPNAME.tar.gz root@194.29.186.116:/app
	scp configs/config-production.yaml root@194.29.186.116:/app/configs/config.yaml
	scp -r configs/defaultavatar/ root@194.29.186.116:/app/configs/
else
	make start
fi
#make clean
