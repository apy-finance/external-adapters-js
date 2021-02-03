#!/usr/bin/env bash

docker-compose exec node bash -c "\
    chainlink admin login -f /docker/api && \
    if !(chainlink jobs list | grep -q fluxmonitor); then \
        chainlink bridges create /docker/bridge.json; \
        chainlink jobs create /docker/tvlAgg-spec.json; \
    fi \
"