# Wildlife licencing extract application and licence data

#### For Natural England

Processor to consume the applications queue and update the Power Apps database.

The processor reads the data from the database and produces a payload of the following hierarchical structure
Which is consumed by the batch processor
```json
{
  "application": {
    "data": {
      "eligibility": {
        "isOwnerOfLand": true
      },
      "applicationType": "A24 Badger",
      "applicationReferenceNumber": "2022-500100-A24-BAD"
    },
    "keys": {
      "apiKey": "e8fa7a0d-d8dd-4016-9ef3-1503bbffc059",
      "sddsKey": "3601e312-d9f6-ec11-82e6-002248c5c17e"
    },
    "applicant": {
      "data": {
        "fullName": "sss"
      },
      "keys": {
        "apiKey": "656f6707-13e3-459d-8f1e-b1b30df79c09",
        "sddsKey": null
      }
    },
    "sites": [
      {
        "data": {
          "name": "Site 1"
        },
        "keys": {
          "apiKey": "fb893da1-cac2-4131-b9ed-5b518ebe1123",
          "sddsKey": null
        }
      },
      {
        "data": {
          "name": "Site 2"
        },
        "keys": {
          "apiKey": "37619baf-be3f-4be3-a6d3-4e530290cc7c",
          "sddsKey": null
        }
      },
      {
        "data": {
          "name": "Site 3"
        },
        "keys": {
          "apiKey": "42598407-4b66-492b-9b30-ca71d4db3ce0",
          "sddsKey": null
        }
      }
    ]
  }
}
 ```

The response from the batch processor is expected in the following format
```json
[
  {
    "apiTableName": "sites",
    "keys": {
      "apiKey": "e8fa7a0d-d8dd-4016-9ef3-1503bbffc059",
      "sddsKey": "3601e312-d9f6-ec11-82e6-002248c5c17e"
    }
  }
]
```
