# Wildlife licencing - Powerapps lib

#### For Natural England

## Overview
### The outbound process
![Outbound](./powerapps-lib-outbound.png)

(1) When any service implementing the powerapps-lib is started, such as the application-queue-processor, it will initialize the schema from the set of metadata definitions described in the ``` packages/powerapps-lib/src/schema``` directory. The definition is used to instantiate a __tableset__ which is a meta-model object which maps the input data JSON structure to the target Power-Platform structure. The mapping for each data item is stored in a path variable in the __tableset__.

(2) When a job is picked up from the queue it is processed by __applicationJobProcess__ in ```packages/application-queue-processor/src/application-job-process.js```. This reads the userId and applicationId for the job and extracts the JSON data from the application, sites and application-sites tables. This is combined into two single JSON objects; a data object and a keys object. The keys object is generated if null and the known API (Postgres) keys are set. The application data and keys objects are deeply nested structures and contain JSON blocks with child data which must be written to the contacts and accounts tables on Power Platform.

An outline of the data object for an application update
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

Reference data may be referred to by name, and global option sets must be addressed by their numeric identifier;
```json
{
  "application": {
    "applicationType": "A24 Badger",
    "applicationCategory": 100000001
  }
}
```

(3) The data JSON objects is passed to __batchUpdate__ in ```packages/powerapps-lib/src/batch-update/batch-update.js```. This first creates a batch request handle which stores the newly generated batchId. The batch request body is then generated. The heavy lifting is done by  __createBatchRequestObjects__ in ```packages/powerapps-lib/src/schema/processors/schema-processes.js``` which creates a sequential array of objects, each representing a single operation within the batch and contains details of all the assignments, the relationship bindings, and the creation of many-to-many relationships.

(4) The response is then parsed for errors and any errors are logged. If there are no errors then the dataverse keys are retrieved from the response and returned to the queue processor in an array.

(5) The keys returned are written down into the database.

(6) If the batch request does not succeed then an exception will be thrown; either a recoverable error exception or an unrecoverable error exception. Recoverable errors will return a Promise.reject will will prompt the queue processor to retry. Unrecoverable errors are logged and removed from the queue by returning Promise.resolve. Request errors are classified as follows;
- 5XX are all recoverable
- 4XX are all unrecoverable except authorization errors 401 and client timeout 408
- Unexpected errors such as network errors are recoverable. Redirections (3XX are not expected)

### The inbound process
All inbound processes that follow the same pattern; inbounds exist for applications, sites, application-sites and reference data.

The following example illustrates the applications inbound process, but it is common to all inbound processes;

![Inbound](./powerapps-lib-inbound.png)

(1) When a service including the powerapps-lib is started the set of read-stream functions are created. When these functions are called they will open a started read-stream.

(2) The schema object is used to create a transformer function and a request path. The request path is an expansion of the schema into a nested ODATA query, and the transformer function is inserted into the stream to produce a sequence of single objects compliant with the API source data-structure.

(3) The database writer wraps the stream and a function to write the data into the database.
