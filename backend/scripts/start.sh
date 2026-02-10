set -e
ENV=$1

if [ "$ENV" == "testing" ]; then
  APP='pawtracktest'
elif [ "$ENV" == "prerelease" ]; then
  APP='pawtrackpre'
elif [ "$ENV" == "production" ]; then
  APP='pawtrack'
else
  echo 'invalid type'
  exit 1
fi

rm -rf ${APP}
tar -xzvf ${APP}.tar.gz
cd release
mv ${APP} ..
cd ..
sudo rm -rf release
sudo rm -rf ${APP}.tar.gz
supervisorctl restart ${APP} 
