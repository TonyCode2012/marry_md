#!/bin/bash

basedir=$(cd `dirname $0`;pwd)
userTpl=$basedir/user.template
nexusTpl=$basedir/nexus.template
userData=$basedir/user-data.json
nexusData=$basedir/nexus-data.json
echo $basedir

loop=10
i=0
coms=(alibaba tencent cisco)

true > $userData
true > $nexusData

for com in ${coms[@]}; do
    for ((i=0;i<loop;i++)); do
        now=`date`
        openid=${com}${i}
        id=$(echo $now$openid | base64)
        if [ $((`echo $RANDOM` % 2)) -eq 0 ]; then 
            gender=male
        else
            gender=female
        fi
        echo `sed -e "s@%ID%@$id@g" -e "s@%OPENID%@$openid@g" -e "s@%COMPANY%@$com@g" -e "s@%GENDER%@$gender@g" -e "s@%NAME%@$openid@g" $userTpl` >> $userData
        echo `sed -e "s@%ID%@$id@g" -e "s@%OPENID%@$openid@g" -e "s@%COMPANY%@$com@g" -e "s@%GENDER%@$gender@g" -e "s@%NAME%@$openid@g" $nexusTpl` >> $nexusData
    done
done
