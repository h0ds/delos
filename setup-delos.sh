#!/bin/bash
set -e

# Use Homebrew Node v22
NODE_BIN="/opt/homebrew/opt/node@22/bin"
export PATH="$NODE_BIN:$PATH"

NODE_VER=$($NODE_BIN/node -v)
NPM_VER=$($NODE_BIN/npm -v)

echo "════════════════════════════════════════"
echo "🚀 Delos Setup"
echo "════════════════════════════════════════"
echo ""
echo "📍 Node: $NODE_VER"
echo "📍 npm: $NPM_VER"
echo ""

if [ -d "node_modules" ] || [ -d "packages/client/node_modules" ] || [ -d "packages/server/node_modules" ]; then
  echo "⚠️  Existing node_modules found. Cleaning..."
  rm -rf node_modules packages/*/node_modules
fi

echo "📥 Installing dependencies..."
$NODE_BIN/npm install --legacy-peer-deps

echo ""
echo "✅ Setup complete!"
echo ""
echo "════════════════════════════════════════"
echo "🎯 Quick Start Commands"
echo "════════════════════════════════════════"
echo ""
echo "Development (both servers):"
echo "  npm run dev"
echo ""
echo "Frontend only (React + Vite):"
echo "  npm run dev:client"
echo "  → http://localhost:5173"
echo ""
echo "Backend only (Express.js):"
echo "  npm run dev:server"
echo "  → http://localhost:3333"
echo ""
echo "Build for production:"
echo "  npm run build"
echo ""
echo "════════════════════════════════════════"
