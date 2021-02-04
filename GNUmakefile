.DEFAULT_GOAL := help

SHELL := bash

DOCKERHOST := $(shell ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $$2 }' | cut -f2 -d: | head -n1)

.PHONY: help
help:
	@echo ""
	@echo "OPERATE:"
	@echo "build                    Build images"
	@echo "up                       Start all containers"
	@echo "down                     Stop all containers"
	@echo "restart                  Stop then start containers"
	@echo "rebuild                  Stop, build, then start containers"
	@echo ""
	@echo "DATA:"
	@echo "create_job               Create job spec in Postgres"
	@echo "nuke_db                  Delete Postgres data"
	@echo "nuke_chainlink           Delete Chainlink info"
	@echo ""
	@echo "DEBUGGING:"
	@echo "logs                     Re-attach to running container logs"
	@echo "log                      Re-attach to specified running container log"
	@echo "ps                       List running container info"
	@echo "bash                     Bash inside a container (default=node)"
	@echo ""
	@echo "MAINTENANCE:"
	@echo "clean                    Remove dangling images and exited containers"
	@echo "clear_logs               Truncate Docker logs"
	@echo ""

.PHONY: build
build:
	docker-compose build
	@echo "All built 🏛"

.PHONY: up
up:
	DOCKERHOST=$(DOCKERHOST) docker-compose up -d
	@make logs

.PHONY: down
down:
	docker-compose stop

.PHONY: restart
restart:
	@echo "make down ==> make up"
	@make down
	@make up

.PHONY: rebuild
rebuild:
	@echo "make down ==> make build ==> make up"
	@make down
	@make build
	@make up

.PHONY: logs
logs:
	docker-compose logs -f 

.PHONY: log
log:
	@if test -z $(name); then\
	    echo "";\
	    echo "Please enter a container name as argument.";\
	    echo "";\
	    echo " e.g. 'make log name=node'";\
	    echo "";\
	    echo "or use 'make logs' to attach to all container logs.";\
	    echo "";\
	    echo "Available container names are:";\
	    echo "  node";\
	    echo "  db";\
	    echo "  adapter";\
	else\
	  docker-compose logs -f $(name);\
	fi

.PHONY: bash
bash:
	@if test -z $(name); then\
	    echo "bash in node container:";\
	    docker-compose exec node bash;\
	else\
	    echo "bash in $(name) container:";\
	    docker-compose exec $(name) bash;\
	fi

.PHONY: clean
clean:
	@echo "Deleting exited containers..."
	docker ps -a -q -f status=exited | xargs docker rm -v
	@echo "Deleting dangling images..."
	docker images -q -f dangling=true | xargs docker rmi
	@echo "All clean 🛀"

.PHONY: nuke_chainlink
nuke_chainlink:
	@read -r -p "WARNING: this will delete all chainlink data (ctrl-c to exit / any other key to continue)." input
	@make down
	@docker-compose rm --force --stop -v node
	@docker volume rm external-adapters-js_node-data
	@echo "Chainlink volume deleted 💣"

.PHONY: nuke_db
nuke_db:
	@read -r -p "WARNING: this will delete all data from Postgres (ctrl-c to exit / any other key to continue)." input
	@make down
	@docker-compose rm --force --stop -v db
	@docker volume rm external-adapters-js_db-data
	@echo "Postgres data deleted 💣"

# https://stackoverflow.com/a/51866793/1175053
.PHONY: clear_logs
clear_logs:
	docker run -it --rm --privileged --pid=host alpine:latest nsenter -t 1 -m -u -n -i -- sh -c 'truncate -s0 /var/lib/docker/containers/*/*-json.log'

.PHONY: ps
ps:
	docker-compose ps

.PHONY: create_job
create_job:
	@docker-compose exec node bash -c "\
		chainlink admin login -f /docker/api && \
		if !(chainlink jobs list | grep -q fluxmonitor); then \
			chainlink bridges create /docker/bridge.json; \
			chainlink jobs create /docker/tvlAgg-spec.json; \
		fi \
	"
