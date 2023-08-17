/*
 * Mock the hapi request object
 */
const path = 'site'
const req = {
  path,
  payload: {
    name: 'The badger set',
    address: {
      houseNumber: 'The fields',
      addrline1: 'Winscombe',
      county: 'Somerset',
      postcode: 'bs25 2ZZ'
    },
    gridReference: '7868962'
  }
}

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = { request: {} }

jest.mock('@defra/wls-database-model')

let models
let postSite
let cache
const applicationJson = 'application/json'

describe('The postSite handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    postSite = (await import('../post-site.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.sites = {
      create: jest.fn(async () => ({ dataValues: { id: 'bar', ...ts } }))
    }
    cache.save = jest.fn(() => null)
    await postSite(context, req, h)
    expect(models.sites.create).toHaveBeenCalledWith({
      id: expect.any(String),
      updateStatus: 'L',
      site: (({ ...l }) => l)(req.payload)
    })
    expect(cache.save).toHaveBeenCalledWith('/site/bar', { id: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('throws with an insert error', async () => {
    cache.save = jest.fn(() => null)
    models.sites = {
      create: jest.fn(async () => {
        throw new Error()
      })
    }
    await expect(async () => {
      await postSite(context, req, h)
    }).rejects.toThrow()
  })
})
