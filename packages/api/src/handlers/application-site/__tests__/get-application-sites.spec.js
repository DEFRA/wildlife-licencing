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
      userId: 'aac6b84d-0407-4f45-bb7e-ec855228fae6'
    }
  }
}

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

jest.mock('@defra/wls-database-model')

let models
let getApplicationSites
const applicationJson = 'application/json'

describe('The getApplicationSitesByUserId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getApplicationSites = (await import('../get-application-sites.js')).default
  })

  it('returns an array of application-sites and status 200', async () => {
    models.applicationSites = { findAll: jest.fn(() => ([{ dataValues: { foo: 'bar', ...ts } }])) }
    await getApplicationSites(context, { query: {} }, h)
    expect(models.applicationSites.findAll).toHaveBeenCalledWith({ })
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an array of application-sites and status 200 - with a query', async () => {
    models.applicationSites = { findAll: jest.fn(() => ([{ dataValues: { foo: 'bar', ...ts } }])) }
    await getApplicationSites(context, { query: { foo: 'bar' } }, h)
    expect(models.applicationSites.findAll).toHaveBeenCalledWith({ where: { foo: 'bar' } })
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws on a query error', async () => {
    models.applicationSites = { findAll: jest.fn(() => { throw new Error() }) }
    await expect(async () => {
      await getApplicationSites(context, { query: {} }, h)
    }).rejects.toThrow()
  })
})
