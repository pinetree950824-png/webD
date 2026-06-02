#!/bin/bash

# Start Nginx service
echo "Starting Nginx..."
service nginx start

# Start Node backend server
echo "Starting DuelVerse Node server..."
npm start
