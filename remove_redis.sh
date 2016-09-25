#!/bin/bash
sudo docker rm -f NSM_LBX_REDIS_0
sudo docker rm -f NSM_LBX_REDIS_1
sudo docker rm -f NSM_LBX_REDIS_2

sudo docker rm -f NSM_LBX_SENTINEL_0
sudo docker rm -f NSM_LBX_SENTINEL_1
sudo docker rm -f NSM_LBX_SENTINEL_2
