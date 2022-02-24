/*
 * Mock the hapi request object
 */
const path = 'user/uuid/site/uuid'
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
const context = {
  request: {
    params: {
      userId: 'aac6b84d-0407-4f45-bb7e-ec855228fae6',
      siteId: '1bfe075b-377e-472b-b160-a6a454648e23'
    }
  }
}

jest.mock('@defra/wls-database-model')

let models
let deleteSite
let cache

describe('The deleteApplication handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    cache = (await import('../../../services/cache.js')).cache
    deleteSite = (await import('../delete-site.js')).default
  })

  it('returns a 204 on successful delete', async () => {
    cache.delete = jest.fn()
    models.applicationSites = { findAll: jest.fn(() => []) }
    models.sites = { destroy: jest.fn(() => 1) }
    await deleteSite(context, req, h)
    expect(models.sites.destroy).toHaveBeenCalledWith({ where: { id: context.request.params.siteId } })
    expect(cache.delete).toHaveBeenCalledWith(`/user/${context.request.params.userId}/site/${context.request.params.siteId}`)
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 404 on id not found', async () => {
    cache.delete = jest.fn()
    models.applicationSites = { findAll: jest.fn(() => []) }
    models.sites = { destroy: jest.fn(() => 0) }
    await deleteSite(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 409 fi has application-site', async () => {
    cache.delete = jest.fn()
    models.applicationSites = { findAll: jest.fn(() => [{}]) }
    await deleteSite(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(409)
  })

  it('returns a 500 with an unexpected database error', async () => {
    cache.delete = jest.fn()
    models.applicationSites = { findAll: jest.fn(() => []) }
    models.sites = { destroy: jest.fn(() => { throw Error() }) }
    await expect(async () => {
      await deleteSite(context, req, h)
    }).rejects.toThrow()
  })
})
