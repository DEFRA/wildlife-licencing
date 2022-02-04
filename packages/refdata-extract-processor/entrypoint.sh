#!/bin/sh
#####################################################################
# Used in the local swarm to initiate the cron job
# Cron needs to have the environment in its own shell
#####################################################################
env >> /etc/environment

# execute CMD
echo "$@"
exec "$@"
