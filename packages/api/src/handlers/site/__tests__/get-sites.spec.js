/*
 * Mock the hapi request object
 */
const path = 'sites'

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
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
let getSites
const applicationJson = 'application/json'

describe('The getSites handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getSites = (await import('../get-sites.js')).default
  })

  it('returns an array of sites and status 200 from the database', async () => {
    models.sites = {
      findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }])
    }
    await getSites({}, { query: {}, path }, h)
    expect(models.sites.findAll).toHaveBeenCalledWith({})
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an array of sites and status 200 from the database with a query', async () => {
    models.sites = {
      findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }])
    }
    await getSites(
      {},
      {
        query: { role: 'USER', userId: '6877f11b-3755-49bc-8a15-9070c756d1ad' },
        path
      },
      h
    )
    expect(models.sites.findAll).toHaveBeenCalledWith({
      include: {
        attributes: [],
        where: {
          role: 'USER',
          userId: '6877f11b-3755-49bc-8a15-9070c756d1ad'
        }
      }
    })
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws on a query error', async () => {
    models.sites = {
      findAll: jest.fn(() => {
        throw new Error()
      })
    }
    await expect(async () => {
      await getSites({}, { query: {} }, h)
    }).rejects.toThrow()
  })
})
