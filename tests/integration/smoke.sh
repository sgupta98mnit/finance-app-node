#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3000}

curl -s "$BASE_URL/health" >/dev/null
curl -s "$BASE_URL/metrics" >/dev/null
curl -s http://localhost:3001/metrics >/dev/null
curl -s http://localhost:3002/metrics >/dev/null
curl -s http://localhost:3003/metrics >/dev/null
curl -s http://localhost:3004/metrics >/dev/null
curl -s http://localhost:3005/metrics >/dev/null
curl -s http://localhost:3006/metrics >/dev/null
