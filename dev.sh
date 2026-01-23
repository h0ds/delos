#!/bin/bash
# Development startup script for Delos
# Direct execution without npm wrapper

NODE="$(which node)"

echo "Using Node: $($NODE --version)"
echo ""
echo "Starting Delos development servers..."
echo "Client: http://localhost:5173"
echo "Server: http://localhost:3333"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

PROJ_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start client
(
  cd "$PROJ_ROOT/packages/client"
  exec $NODE node_modules/vite/bin/vite.js
) &
CLIENT_PID=$!

# Start server
(
  cd "$PROJ_ROOT/packages/server"
  npm run dev
) &
SERVER_PID=$!

# Handle shutdown
trap "kill $CLIENT_PID $SERVER_PID 2>/dev/null; exit 0" EXIT INT TERM

wait
