#!/bin/bash
export PATH="/Users/gjworrall/.nvm/versions/node/v20.20.0/bin:$PATH"
cd "$(dirname "$0")/packages/server"
node src/index.ts
