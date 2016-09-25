# arivipu
Notification System using NodeJs, Socket.io and redis as the notification message store.

#Dockerized container of redis and sentinel

The configuration contains 3 redis nodes [1 Master and 2 slaves] and 3 sentinel nodes with the quorum setting as "2"
       +----+
       | M1 |
       | S1 |
       +----+
          |
+----+    |    +----+
| R2 |----+----| R3 |
| S2 |         | S3 |
+----+         +----+

Configuration: quorum = 2

#Docker Redis Admin Commands

```
sudo docker exec NSM_LBX_SENTINEL_1 cat /etc/redis/sentinel.conf
```
```
docker inspect NSM_LBX_REDIS_1
```
```
sudo iptables -t nat -L -n
```

```
sudo docker exec NSM_LBX_REDIS_0 redis-cli monitor
```
