
describe('The getUserByUserId handler', () => {
  it('returns the userId with a valid uuid', async () => {
    const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'

    const queryData = {
      rows: [{
        id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        created: '2021-11-25T00:00:00.000Z',
        updated: '2021-11-25T00:00:00.000Z',
        sdds_id: null
      }]
    }

    const expected = {
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
      created: '2021-11-25T00:00:00.000Z',
      updated: '2021-11-25T00:00:00.000Z',
      sdds_id: null
    }

    jest.mock('@defra/wls-connectors-lib')
    const { DATABASE } = await import('@defra/wls-connectors-lib')
    const mockQuery = jest.fn(async () => (queryData))
    DATABASE.getPool = jest.fn(() => ({ connect: async () => ({ query: mockQuery, release: jest.fn() }) }))
    const getUserByUserId = (await import('../get-user-by-user-id.js')).default

    const codeFunc = jest.fn()
    const resFunc = jest.fn(() => ({ code: codeFunc }))
    const context = { request: { params: { userId: uuid } } }
    await getUserByUserId(context, null, { response: resFunc })
    expect(resFunc).toHaveBeenCalledWith(expected)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 with valid uuid not found', async () => {
    const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
    const queryData = { rows: [] }

    jest.mock('@defra/wls-connectors-lib')
    const { DATABASE } = await import('@defra/wls-connectors-lib')
    const mockQuery = jest.fn(async () => (queryData))
    DATABASE.getPool = jest.fn(() => ({ connect: async () => ({ query: mockQuery, release: jest.fn() }) }))
    const getUserByUserId = (await import('../get-user-by-user-id.js')).default

    const codeFunc = jest.fn()
    const resFunc = jest.fn(() => ({ code: codeFunc }))
    const context = { request: { params: { userId: uuid } } }
    await getUserByUserId(context, null, { response: resFunc })
    expect(codeFunc).toHaveBeenCalledWith(404)
  })
})
