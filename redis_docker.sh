#!/bin/bash
#
#
#Redis => 1 Master: 2 Slaves
#
#Sentinels = > 3 sentinels with Qurom 2
#
#

# Get the IP address of your docker container

#DOCKER_IP=$(ifconfig docker0 | grep 'inet addr:' | cut -d: -f2  | awk '{ print $1}')

#echo "DOCKER IP : $DOCKER_IP"

# create three redis instances of version 3.0 (stable as of 28th April, 2016)

 docker run --name NSM_LBX_REDIS_0 -t -d -i redis:3.0
 docker run --name NSM_LBX_REDIS_1 -t -d -i redis:3.0
 docker run --name NSM_LBX_REDIS_2 -t -d -i redis:3.0

#get master ip
REDIS_0_IP=$( docker inspect --format '{{ .NetworkSettings.IPAddress }}' NSM_LBX_REDIS_0)
REDIS_1_IP=$( docker inspect --format '{{ .NetworkSettings.IPAddress }}' NSM_LBX_REDIS_1)
REDIS_2_IP=$( docker inspect --format '{{ .NetworkSettings.IPAddress }}' NSM_LBX_REDIS_2)

echo "REDIS_0_IP : $REDIS_0_IP"
echo "REDIS_1_IP : $REDIS_1_IP"
echo "REDIS_2_IP : $REDIS_2_IP"

# start up the sentinels
 docker run --name NSM_LBX_SENTINEL_0 -d -p 26379:26379 joshula/redis-sentinel --sentinel announce-ip $DOCKER_IP --sentinel announce-port 26379
 docker run --name NSM_LBX_SENTINEL_1 -d -p 26378:26379 joshula/redis-sentinel --sentinel announce-ip $DOCKER_IP --sentinel announce-port 26378
 docker run --name NSM_LBX_SENTINEL_2 -d -p 26377:26379 joshula/redis-sentinel --sentinel announce-ip $DOCKER_IP --sentinel announce-port 26377

#get sentinel ips
SENTINEL_0_IP=$( docker inspect --format '{{ .NetworkSettings.IPAddress }}' NSM_LBX_SENTINEL_0)
SENTINEL_1_IP=$( docker inspect --format '{{ .NetworkSettings.IPAddress }}' NSM_LBX_SENTINEL_1)
SENTINEL_2_IP=$( docker inspect --format '{{ .NetworkSettings.IPAddress }}' NSM_LBX_SENTINEL_2)

echo "SENTINEL_0_IP : $SENTINEL_0_IP"
echo "SENTINEL_1_IP : $SENTINEL_1_IP"
echo "SENTINEL_2_IP : $SENTINEL_2_IP"

##LINK slaves and Master
redis-cli -h $REDIS_1_IP -p 6379 slaveof $REDIS_0_IP 6379
redis-cli -h $REDIS_2_IP -p 6379 slaveof $REDIS_0_IP 6379

## SET the Redis-Client to Monitor the Master Node
# sentinel monitor <master-group-name> <ip> <port> <quorum>
redis-cli -p 26379 sentinel monitor testing $REDIS_0_IP 6379 2
redis-cli -p 26379 sentinel set testing down-after-milliseconds 1000
redis-cli -p 26379 sentinel set testing failover-timeout 1000
redis-cli -p 26379 sentinel set testing parallel-syncs 1

redis-cli -p 26378 sentinel monitor testing $REDIS_0_IP 6379 2
redis-cli -p 26378 sentinel set testing down-after-milliseconds 1000
redis-cli -p 26378 sentinel set testing failover-timeout 1000
redis-cli -p 26378 sentinel set testing parallel-syncs 1

redis-cli -p 26377 sentinel monitor testing $REDIS_0_IP 6379 2
redis-cli -p 26377 sentinel set testing down-after-milliseconds 1000
redis-cli -p 26377 sentinel set testing failover-timeout 1000
redis-cli -p 26377 sentinel set testing parallel-syncs 1
