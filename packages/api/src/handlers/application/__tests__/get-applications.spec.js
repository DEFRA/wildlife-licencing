/*
 * Mock the hapi request object
 */
const path = 'applications'
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
let getApplications
const applicationJson = 'application/json'

describe('The getApplication handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getApplications = (await import('../get-applications.js')).default
  })

  it('returns an array of applications and status 200 from the database', async () => {
    models.applications = {
      findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }])
    }
    await getApplications({ }, { query: { }, path }, h)
    expect(models.applications.findAll).toHaveBeenCalledWith(expect.objectContaining({
      include: {
        attributes: [],
        through: {
          attributes: []
        }
      }
    }))
    expect(h.response).toHaveBeenCalledWith([expect.objectContaining({ foo: 'bar', ...tsR })])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an array of applications and status 200 from the database with a query', async () => {
    models.applications = {
      findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }])
    }
    await getApplications({ }, { query: { role: 'USER', userId: '6877f11b-3755-49bc-8a15-9070c756d1ad' }, path }, h)
    expect(models.applications.findAll).toHaveBeenCalledWith(expect.objectContaining({
      include:
        {
          attributes: [],
          through: { attributes: [], where: { role: 'USER' } },
          where: { id: '6877f11b-3755-49bc-8a15-9070c756d1ad' }
        }
    }))
    expect(h.response).toHaveBeenCalledWith([expect.objectContaining({ foo: 'bar', ...tsR })])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws on a query error', async () => {
    models.applications = { findAll: jest.fn(() => { throw new Error() }) }
    await expect(async () => {
      await getApplications({ }, req, h)
    }).rejects.toThrow()
  })
})
