#!/bin/bash
 docker start NSM_LBX_REDIS_0
 docker start NSM_LBX_REDIS_1
 docker start NSM_LBX_REDIS_2

 docker start NSM_LBX_SENTINEL_0
 docker start NSM_LBX_SENTINEL_1
 docker start NSM_LBX_SENTINEL_2
