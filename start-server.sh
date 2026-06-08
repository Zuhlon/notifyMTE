#!/bin/bash
cd /home/z/my-project
NODE_ENV=production node .next/standalone/server.js &
PID=$!
echo $PID > /tmp/server.pid

# Aggressive keepalive
while kill -0 $PID 2>/dev/null; do
    curl -s -o /dev/null http://localhost:3000 2>/dev/null &
    sleep 1
done

echo "Server process $PID has exited" >> /tmp/server-cleanup.log
