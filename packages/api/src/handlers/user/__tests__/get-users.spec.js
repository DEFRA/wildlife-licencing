/*
 * Mock the hapi request object
 */

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
const context = { request: {} }

jest.mock('@defra/wls-database-model')

let models
let getUsers
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
describe('The getUsers handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    cache = (await import('../../../services/cache.js')).cache
    getUsers = (await import('../get-users.js')).default
  })

  it('returns the users and status 200 the cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify([{ foo: 'bar' }]))
    await getUsers(context, { query: null, path: '/users' }, h)
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar' }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns the users and status 200 the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn(() => null)
    models.users = { findAll: jest.fn(() => ([{ dataValues: { username: 'Graham', ...ts } }])) }
    await getUsers(context, { query: null, path: '/users' }, h)
    expect(cache.save).toHaveBeenCalledWith('/users', [{ username: 'Graham', ...tsR }])
    expect(models.users.findAll).toHaveBeenCalled()
    expect(h.response).toHaveBeenCalledWith([{ username: 'Graham', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a singleton array of users and status 200 the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn(() => null)
    models.users = { findAll: jest.fn(() => ([{ dataValues: { username: 'Graham', ...ts } }])) }
    await getUsers(context, { query: { username: 'Graham' }, path: '/users' }, h)
    expect(cache.save).toHaveBeenCalledWith('/users?username=Graham', [{ username: 'Graham', ...tsR }])
    expect(models.users.findAll).toHaveBeenCalledWith({ where: { username: 'Graham' } })
    expect(h.response).toHaveBeenCalledWith([{ username: 'Graham', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws on an unexpected database error', async () => {
    cache.restore = jest.fn(() => null)
    models.users = { findAll: jest.fn(() => { throw new Error() }) }
    await expect(async () => {
      await getUsers(context, { query: null, path: '/users' }, h)
    }).rejects.toThrow()
  })
})
