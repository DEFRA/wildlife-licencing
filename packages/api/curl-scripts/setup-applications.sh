curl -X 'POST' \
  'http://localhost:3000/application' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "proposalDescription": "Application 1",
  "applicationReferenceNumber": "2022-502301-A24-BAD"
}'

curl -X 'POST' \
  'http://localhost:3000/application' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "proposalDescription": "Application 2",
  "applicationReferenceNumber": "2022-502302-A24-BAD"
}'

curl -X 'POST' \
  'http://localhost:3000/application' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "proposalDescription": "Application 3",
  "applicationReferenceNumber": "2022-502303-A24-BAD"
}'


curl -X 'GET' \
  'http://localhost:3000/applications' \
  -H 'accept: application/json' | node prettify.js
