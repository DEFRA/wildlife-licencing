import { Methods } from '../../schema/processors/schema-processes.js'
import fs from 'fs'
import path from 'path'
const changeSetRegEx = /changeset_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g
const batchRegEx = /--batch_[0-9A-F]{6}/g

describe('Batch query formation', () => {
  beforeEach(() => jest.resetModules())
  it('a new handler is generated when a batch request is opened', async () => {
    const { openBatchRequest } = await import('../batch-formation.js')
    expect(openBatchRequest([1], 'foo')).toEqual(expect.objectContaining({
      batchId: expect.any(String),
      clientUrl: 'foo',
      tableSet: [1]
    }))
  })

  it('generates a serialized batch request', async () => {
    jest.doMock('../../schema/processors/schema-processes.js', () => ({
      Methods: Methods,
      createBatchRequestObjects: () => ([
        { contentId: 1, table: 'tab1', method: 'POST', assignments: { foo: 'bar' } },
        { contentId: 2, table: 'tab1', method: 'PATCH', powerAppsId: '453', assignments: { foo: 'bar' } },
        { contentId: 3, table: 'tab1', method: 'PUT', powerAppsId: '123', assignments: { foo: 'bar' } }
      ])
    }))
    const { openBatchRequest, createBatchRequest } = await import('../batch-formation.js')
    const handle = openBatchRequest([], 'foo')
    const expected = fs.readFileSync(path.join(__dirname, './batch-request-body.txt'), { encoding: 'utf8' })
    const result = await createBatchRequest(handle, {}, {})
    expect(result).toContain(`--batch_${handle.batchId}`)
    expect(result.replace(changeSetRegEx, '__cs__').replace(batchRegEx, '__b__'))
      .toBe(expected.replace(changeSetRegEx, '__cs__').replace(batchRegEx, '__b__'))
  })

  it('decorates the key object from the response', async () => {
    jest.doMock('../../schema/processors/schema-processes.js', () => ({
      Methods: Methods,
      createBatchRequestObjects: () => ([
        { contentId: 1, apiTable: 'tab1', apiKey: '123', assignments: { foo: 'bar1' } },
        { contentId: 2, apiTable: 'tab2', apiKey: '456', assignments: { foo: '__URL__/bar2' } },
        { contentId: 3, apiTable: 'tab3', apiKey: '789', assignments: { foo: 'bar3' } }
      ])
    }))
    const { openBatchRequest, createKeyObject, createBatchRequest } = await import('../batch-formation.js')
    const response = fs.readFileSync(path.join(__dirname, './batch-response-body.txt'), { encoding: 'utf8' })
    const handle = openBatchRequest([], 'foo')
    await createBatchRequest(handle, {}, {})
    const result = createKeyObject(handle, response)
    expect(result).toEqual([
      {
        apiTableName: 'tab1',
        keys: {
          apiKey: '123',
          sddsKey: '8c75e48d-1393-ec11-b400-0022481ac7f1'
        }
      },
      {
        apiTableName: 'tab2',
        keys: {
          apiKey: '456',
          sddsKey: '8f75e48d-1393-ec11-b400-0022481ac7f1'
        }
      }
    ])
  })
})
