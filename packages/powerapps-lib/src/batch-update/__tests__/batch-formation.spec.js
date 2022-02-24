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
    const { openBatchRequest, createKeyObject } = await import('../batch-formation.js')
    const keySet = [{
      apiTable: 'applications',
      apiKey: '8d382932-36ba-4969-84f5-380f4f6830c1',
      apiBasePath: 'application',
      powerAppsTable: 'sdds_applications',
      contentId: 2
    },
    {
      apiTable: 'applications',
      apiKey: null,
      apiBasePath: 'application.applicant',
      powerAppsTable: 'contacts',
      contentId: 1
    }]
    const response = fs.readFileSync(path.join(__dirname, './batch-response-body.txt'), { encoding: 'utf8' })
    const handle = openBatchRequest([], 'foo')
    const result = createKeyObject(handle, response, keySet)
    expect(result).toEqual([
      expect.objectContaining({
        powerAppsKey: '8f75e48d-1393-ec11-b400-0022481ac7f1',
        powerAppsTable: 'sdds_applications'
      }), expect.objectContaining({
        powerAppsKey: '8c75e48d-1393-ec11-b400-0022481ac7f1',
        powerAppsTable: 'contacts'
      })
    ])
  })
})
