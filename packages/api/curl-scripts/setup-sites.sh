curl -X 'POST' \
  'http://localhost:3000/site' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "site 1"
}'

curl -X 'POST' \
  'http://localhost:3000/site' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "site 2"
}'

curl -X 'POST' \
  'http://localhost:3000/site' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "site 3"
}'

curl -X 'GET' \
  'http://localhost:3000/sites' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' | node prettify.js
