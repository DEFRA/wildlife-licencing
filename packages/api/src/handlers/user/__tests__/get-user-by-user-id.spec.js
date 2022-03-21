/*
 * Mock the hapi request object
 */
const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
const path = 'user/uuid'
const req = { path }

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
const context = { request: { params: { userId: uuid } } }

jest.mock('@defra/wls-database-model')

let models
let getUser
let cache

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

const applicationJson = 'application/json'
describe('The getUserByUserId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache

    getUser = (await import('../get-user-by-user-id.js')).default
  })

  it('returns a user and status 200 the cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
    await getUser(context, req, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a user and status 200 the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn(() => null)
    models.users = { findByPk: jest.fn(() => ({ dataValues: { foo: 'bar', ...ts } })) }
    await getUser(context, req, h)
    expect(cache.save).toHaveBeenCalledWith(path, { foo: 'bar', ...tsR })
    expect(models.users.findByPk).toHaveBeenCalledWith(uuid)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 with user id not found', async () => {
    cache.restore = jest.fn(() => null)
    models.users = { findByPk: jest.fn(() => null) }
    await getUser(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on an unexpected database error', async () => {
    cache.restore = jest.fn(() => null)
    models.users = { findByPk: jest.fn(() => { throw new Error() }) }
    await expect(async () => {
      await getUser(context, req, h)
    }).rejects.toThrow()
  })
})
