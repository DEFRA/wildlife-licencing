/*
 * Mock the hapi request object
 */

const path = '/application-site/uuid'
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
      applicationAccountId: '1bfe075b-377e-472b-b160-a6a454648e23'
    }
  }
}

jest.mock('@defra/wls-database-model')

let models
let deleteApplicationAccountByApplicationAccountId
let cache

describe('The deleteApplicationAccountByApplicationAccountId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
    deleteApplicationAccountByApplicationAccountId = (await import('../delete-application-account-by-application-account-id.js')).default
  })

  it('returns a 204 on successful delete', async () => {
    cache.delete = jest.fn()
    models.applicationAccounts = { destroy: jest.fn(() => 1) }
    await deleteApplicationAccountByApplicationAccountId(context, req, h)
    expect(models.applicationAccounts.destroy).toHaveBeenCalledWith({ where: { id: context.request.params.applicationAccountId } })
    expect(cache.delete).toHaveBeenCalledWith(path)
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 404 on id not found', async () => {
    cache.delete = jest.fn()
    models.applicationAccounts = { destroy: jest.fn(() => 0) }
    await deleteApplicationAccountByApplicationAccountId(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 500 with an unexpected database error', async () => {
    cache.delete = jest.fn()
    models.applicationAccounts = { destroy: jest.fn(() => { throw Error() }) }
    await expect(async () => {
      await deleteApplicationAccountByApplicationAccountId(context, req, h)
    }).rejects.toThrow()
  })
})
