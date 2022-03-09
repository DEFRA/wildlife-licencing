#!/bin/sh
#####################################################################
# Used to initiate the cron job - Cron needs to have the environment
# in its own shell.
#
# Run once first to initialize
#####################################################################
env >> /etc/environment

echo Initializing...
cd /app && node src/processor.js

# execute CMD
echo Running cron...
echo "$@"
exec "$@"
