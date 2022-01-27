/* eslint-disable camelcase */
import { openBatchRequest, createBatchRequestBody, createKeyObject } from '../batch-formation.js'
import { tasks, srcData } from '../../test-model-data/task-model.js'
import fs from 'fs'
import path from 'path'

const changeSetRegEx = /changeset_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g
const batchRegEx = /--batch_[0-9A-F]{6}/g

/**
 * Content-Type:multipart/mixed;boundary=batch_499D1B
 Accept:application/json
 OData-MaxVersion: 4.0
 OData-Version: 4.0
 Prefer:return=representation
 */
describe('Batch query formation', () => {
  it('forms a correct batch query set for a complex nested insert', async () => {
    const batchId = openBatchRequest({ tasks })
    const clientUrl = 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'
    const batchQuery = await createBatchRequestBody(batchId, srcData, {}, clientUrl)
    const expected = fs.readFileSync(path.join(__dirname, './batch-request-body.txt'), { encoding: 'utf8' })
    expect(batchQuery).toContain(`--batch_${batchId}`)
    expect(batchQuery.replace(changeSetRegEx, '__cs__').replace(batchRegEx, '__b__'))
      .toBe(expected.replace(changeSetRegEx, '__cs__').replace(batchRegEx, '__b__'))
  })

  it('forms a correct batch query set for a complex nested update', async () => {
    const batchId = openBatchRequest({ tasks })
    const clientUrl = 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'
    const batchQuery = await createBatchRequestBody(batchId, srcData, {
      tasks: {
        eid: '9d17ae34-3c62-ec11-8f8f-0022480078af',
        entity: 'tasks'
      }
    }, clientUrl)
    const expected = fs.readFileSync(path.join(__dirname, './batch-request-body.txt'), { encoding: 'utf8' })
    expect(batchQuery).toContain(`--batch_${batchId}`)
    expect(batchQuery.replace(changeSetRegEx, '__cs__').replace(batchRegEx, '__b__'))
      .toBe(expected.replace(changeSetRegEx, '__cs__')
        .replace(batchRegEx, '__b__')
        .replace('POST https://sdds-dev.crm11.dynamics.com/api/data/v9.0/tasks', 'PATCH https://sdds-dev.crm11.dynamics.com/api/data/v9.0/tasks(9d17ae34-3c62-ec11-8f8f-0022480078af)')
      )
  })

  it('creates a valid key object from the response', async () => {
    openBatchRequest({ tasks })
    const baseUrl = 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'
    const responseBody = fs.readFileSync(path.join(__dirname, './success-response.txt'), { encoding: 'utf8' })
    const keyObject = createKeyObject(responseBody, baseUrl)

    // The response is anticipated in sequence order
    expect(keyObject).toEqual({
      systemUser: {
        entity: 'systemUser',
        eid: '7d17ae34-3c62-ec11-8f8f-0022480078af'
      },
      account: {
        entity: 'account',
        eid: '7f17ae34-3c62-ec11-8f8f-0022480078af'
      },
      contact: {
        entity: 'contact',
        eid: '8417ae34-3c62-ec11-8f8f-0022480078af'
      },
      taskType: {},
      tasks: {}
    })
  })
})
