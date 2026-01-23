#!/bin/bash
set -e

# Use Node v22.22.0 explicitly
NODE_BIN="$HOME/.nvm/versions/node/v22.22.0/bin"
NPM="$NODE_BIN/npm"

echo "🔍 Using Node: $($NODE_BIN/node -v)"
echo "📦 Using npm: $($NPM -v)"
echo ""
echo "📥 Installing dependencies..."
$NPM install --legacy-peer-deps

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start development servers, run:"
echo "  npm run dev"
echo ""
echo "Or run individually:"
echo "  npm run dev:client   # Frontend (http://localhost:5173)"
echo "  npm run dev:server   # Backend (http://localhost:3333)"
