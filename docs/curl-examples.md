# Curl Examples

## Auth
curl -s -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"strongpassword"}'

curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"strongpassword"}'

## Accounts
curl -s -X POST http://localhost:3000/accounts \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"userId":"user-123","type":"CHECKING","currency":"USD"}'

curl -s http://localhost:3000/accounts/$ACCOUNT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"

curl -s http://localhost:3000/accounts/$ACCOUNT_ID/balance \
  -H "Authorization: Bearer $ACCESS_TOKEN"

## Transfers
curl -s -X POST http://localhost:3000/transfers \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Idempotency-Key: demo-key-1" \
  -H 'Content-Type: application/json' \
  -d '{"fromAccountId":"acc-1","toAccountId":"acc-2","amount":10.5,"currency":"USD"}'

curl -s http://localhost:3000/transfers/$TRANSFER_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"

## Ledger
curl -s http://localhost:3000/ledger/accounts/$ACCOUNT_ID/entries?limit=10 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
