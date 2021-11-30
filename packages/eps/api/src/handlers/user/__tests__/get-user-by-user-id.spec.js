import { mockPersistence } from '../../../misc/test-utils.js'

const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
const path = 'user/uuid'

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const resFunc = jest.fn(() => ({ type: typeFunc, code: codeFunc }))
const context = { request: { params: { userId: uuid } } }

describe('The getUserByUserId handler', () => {
  it('returns the userId with a valid uuid from the cache', async () => {
    const expected = {
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
      created: '2021-11-25T00:00:00.000Z',
      updated: '2021-11-25T00:00:00.000Z',
      sdds_id: null
    }
    await mockPersistence.init()
    mockPersistence.setMockGet(() => (JSON.stringify(expected)))
    const getUserByUserId = (await import('../get-user-by-user-id.js')).default
    await getUserByUserId(context, { req: { path } }, { response: resFunc })
    expect(mockPersistence.mocks.mockGet).toHaveBeenCalled()
    expect(mockPersistence.mocks.mockQuery).not.toHaveBeenCalled()
    expect(resFunc).toHaveBeenCalledWith(expected)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns the userId with a valid uuid from the database', async () => {
    const expected = {
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
      created: '2021-11-25T00:00:00.000Z',
      updated: '2021-11-25T00:00:00.000Z',
      sdds_id: null
    }
    const queryData = {
      rows: [{
        id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        created: '2021-11-25T00:00:00.000Z',
        updated: '2021-11-25T00:00:00.000Z',
        sdds_id: null
      }]
    }
    await mockPersistence.init()
    mockPersistence.setMockGet(() => null)
    mockPersistence.setMockQuery(() => (queryData))
    const getUserByUserId = (await import('../get-user-by-user-id.js')).default

    await getUserByUserId(context, { req: { path } }, { response: resFunc })
    expect(mockPersistence.mocks.mockGet).toHaveBeenCalled()
    expect(mockPersistence.mocks.mockQuery).toHaveBeenCalled()
    expect(resFunc).toHaveBeenCalledWith(expected)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 with valid uuid not found', async () => {
    const queryData = { rows: [] }
    await mockPersistence.init()
    mockPersistence.setMockGet(() => null)
    mockPersistence.setMockQuery(() => (queryData))
    const getUserByUserId = (await import('../get-user-by-user-id.js')).default
    await getUserByUserId(context, { req: { path } }, { response: resFunc })
    expect(mockPersistence.mocks.mockGet).toHaveBeenCalled()
    expect(mockPersistence.mocks.mockQuery).toHaveBeenCalled()
    expect(resFunc).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 500 with an unexpected database error', async () => {
    await mockPersistence.init()
    mockPersistence.setMockGet(() => null)
    mockPersistence.setMockQuery(() => { throw new Error('Random') })
    const getUserByUserId = (await import('../get-user-by-user-id.js')).default
    await expect(async () => {
      await getUserByUserId(context, { req: { path } }, { response: resFunc })
    }).rejects.toThrow()
  })
})
