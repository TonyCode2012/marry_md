#!/bin/bash
basedir=$(cd `dirname $0`;pwd)
rootdir=$basedir/..
clouddir=$rootdir/cloudfunctions
minidir=$rootdir/miniprogram
appfile=$rootdir/miniprogram/app.js
selfname=$(basename $0)
echo $selfname

prd="prod-env-2019"
dev="dev-2019-xe6cj"

osname=$(uname -s)
osv=""
sup=""

para=$1

if [ -z "$para" ]; then
    echo "[ERROR] please indicate env name!!!"
    exit 1
fi

case $osname in
    Linux*)     osv=Linux;;
    Darwin*)    osv=Mac;sup=".dpswitch";;
    CYGWIN*)    osv=Cygwin;;
    MINGW*)     osv=MinGw;;
    *)          osv=Linux;;
esac


if [ x"$para" = x"prod" ]; then
	sed -i $sup "s@$dev@$prd@g" `grep "$dev" -rl $clouddir | grep -v ".swp"`
    sed -i $sup "s@$dev@$prd@g" $appfile
elif [ x"$para" = x"dev" ]; then
	sed -i $sup "s@$prd@$dev@g" `grep "$prd" -rl $clouddir | grep -v ".swp"`
    sed -i $sup "s@$prd@$dev@g" $appfile
else
    echo "[ERROR] please give right env name!!!"
    exit 1
fi

cd $rootdir
find . -name "*$sup" | xargs -I {} rm {}
cd -
