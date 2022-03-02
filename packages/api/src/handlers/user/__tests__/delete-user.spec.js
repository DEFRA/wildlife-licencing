/*
 * Mock the hapi request object
 */
const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
const path = `/user/${uuid}`
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
let deleteUser
let cache

describe('The deleteUser handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    cache = (await import('../../../services/cache.js')).cache
    deleteUser = (await import('../delete-user.js')).default
  })

  it('returns a 204 on successful delete', async () => {
    cache.delete = jest.fn()
    cache.keys = jest.fn(() => ['random'])
    models.users = { destroy: jest.fn(() => 1) }
    models.applications = { findAll: jest.fn(() => []) }
    models.sites = { findAll: jest.fn(() => []) }
    await deleteUser(context, req, h)
    expect(models.users.destroy).toHaveBeenCalledWith({ where: { id: uuid } })
    expect(cache.delete).toHaveBeenCalledWith(req.path)
    expect(cache.delete).toHaveBeenCalledWith('/users')
    expect(cache.delete).toHaveBeenCalledWith('random')
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 409 with an application', async () => {
    cache.delete = jest.fn()
    models.users = { destroy: jest.fn(() => 1) }
    models.applications = { findAll: jest.fn(() => [{ foo: 'bar' }]) }
    await deleteUser(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(409)
  })

  it('returns a 409 with an site', async () => {
    cache.delete = jest.fn()
    models.users = { destroy: jest.fn(() => 1) }
    models.applications = { findAll: jest.fn(() => []) }
    models.sites = { findAll: jest.fn(() => [{ foo: 'bar' }]) }
    await deleteUser(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(409)
  })

  it('returns a 404 on id not found', async () => {
    cache.delete = jest.fn()
    models.users = { destroy: jest.fn(() => 0) }
    models.applications = { findAll: jest.fn(() => []) }
    models.sites = { findAll: jest.fn(() => []) }
    await deleteUser(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 500 with an unexpected database error', async () => {
    cache.delete = jest.fn()
    models.applications = { findAll: jest.fn(() => []) }
    models.sites = { findAll: jest.fn(() => []) }
    models.users = { destroy: jest.fn(() => { throw Error() }) }
    await expect(async () => {
      await deleteUser(context, req, h)
    }).rejects.toThrow()
  })
})
