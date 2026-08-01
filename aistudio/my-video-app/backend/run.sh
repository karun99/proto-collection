#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Created .env from .env.example — add your API keys there."
fi

if ! python3 -c "import fastapi, uvicorn, yaml, PIL, requests" 2>/dev/null; then
  echo "Installing backend dependencies..."
  python3 -m pip install -r requirements.txt
fi

exec python3 app.py "$@"
