#!/usr/bin/env bash

docker-compose exec node bash -c "\
    chainlink admin login -f /docker/api; \
    chainlink bridges create /docker/bridge.json; \
    chainlink jobs create /docker/tvlAgg-spec.json; \
"