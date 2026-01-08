#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3000}
EMAIL=${EMAIL:-flow.user@example.com}
PASSWORD=${PASSWORD:-strongpassword}

command -v jq >/dev/null 2>&1 || { echo "jq is required"; exit 1; }

curl -s -X POST "$BASE_URL/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" >/dev/null || true

ACCESS_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r .accessToken)

ACCOUNT_1=$(curl -s -X POST "$BASE_URL/accounts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"userId":"user-2","type":"CHECKING","currency":"USD"}' | jq -r .id)

ACCOUNT_2=$(curl -s -X POST "$BASE_URL/accounts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"userId":"user-2","type":"SAVINGS","currency":"USD"}' | jq -r .id)

TRANSFER_ID=$(curl -s -X POST "$BASE_URL/transfers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Idempotency-Key: flow-transfer-1" \
  -H 'Content-Type: application/json' \
  -d "{\"fromAccountId\":\"$ACCOUNT_1\",\"toAccountId\":\"$ACCOUNT_2\",\"amount\":\"15\",\"currency\":\"USD\"}" | jq -r .id)

curl -s "$BASE_URL/transfers/$TRANSFER_ID" -H "Authorization: Bearer $ACCESS_TOKEN" >/dev/null
