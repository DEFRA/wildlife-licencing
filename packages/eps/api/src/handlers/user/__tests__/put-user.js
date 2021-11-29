import { mockPersistence } from '../../../misc/test-utils.js'

const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
const path = 'user/uuid'
const req = { path, payload: {} }

const queryData = {
  rows: [{
    id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
    created: '2021-11-25T00:00:00.000Z',
    updated: '2021-11-25T00:00:00.000Z',
    sdds_id: null
  }]
}

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const resFunc = jest.fn(() => ({ type: typeFunc }))

const context = { request: { params: { userId: uuid } } }

describe('The putUser handler', () => {
  it('returns a 201 on successful create', async () => {
    await mockPersistence.init()
    const putUser = (await import('../put-user')).default
    mockPersistence.setMockQuery(() => (queryData))
    await putUser(context, req, { response: resFunc })
    expect(mockPersistence.mocks.mockQuery).toHaveBeenCalledWith('INSERT INTO users (id) values ($1) RETURNING *', [uuid])
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key', async () => {
    await mockPersistence.init()
    const putUser = (await import('../put-user')).default
    mockPersistence.mocks.mockQuery
      .mockImplementationOnce(() => { throw new Error('users_pk') })
      .mockImplementationOnce(() => (queryData))

    await putUser(context, req, { response: resFunc })
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 201 on successful create with sddsId', async () => {
    await mockPersistence.init()
    const putUser = (await import('../put-user')).default
    mockPersistence.setMockQuery(() => (queryData))
    req.payload.sddsId = uuid
    await putUser(context, req, { response: resFunc })
    expect(mockPersistence.mocks.mockQuery).toHaveBeenCalledWith('INSERT INTO users (id, sdds_id) values ($1, $2) RETURNING *', [uuid, uuid])
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key with sddsId', async () => {
    await mockPersistence.init()
    const putUser = (await import('../put-user')).default
    req.payload.sddsId = uuid
    mockPersistence.mocks.mockQuery
      .mockImplementationOnce(() => { throw new Error('users_pk') })
      .mockImplementationOnce(() => (queryData))

    await putUser(context, req, { response: resFunc })
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 500 with a random query error (insert query)', async () => {
    await mockPersistence.init()
    const putUser = (await import('../put-user')).default
    mockPersistence.setMockQuery(() => { throw new Error('random') })
    await expect(async () => {
      await putUser(context, req, { response: resFunc })
    }).rejects.toThrow()
  })

  it('returns a 500 with a random query error (update query)', async () => {
    await mockPersistence.init()
    const putUser = (await import('../put-user')).default
    mockPersistence.mocks.mockQuery
      .mockImplementationOnce(() => { throw new Error('users_pk') })
      .mockImplementationOnce(() => { throw new Error('random') })

    await expect(async () => {
      await putUser(context, req, { response: resFunc })
    }).rejects.toThrow()
  })
})
