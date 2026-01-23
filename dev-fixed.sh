#!/bin/bash
set -e

# Use Node v22.22.0 explicitly
NODE_BIN="$HOME/.nvm/versions/node/v22.22.0/bin"
export PATH="$NODE_BIN:$PATH"

echo "🔍 Using Node: $(node -v)"
echo ""
echo "Starting Delos development servers..."
echo "Client: http://localhost:5173"
echo "Server: http://localhost:3333"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

npm run dev:client &
CLIENT_PID=$!

npm run dev:server &
SERVER_PID=$!

# Handle Ctrl+C to kill both processes
trap "kill $CLIENT_PID $SERVER_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
