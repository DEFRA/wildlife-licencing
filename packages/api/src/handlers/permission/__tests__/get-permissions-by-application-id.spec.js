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
const context = {
  request: {
    params: {
      applicationId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77'
    }
  }
}

jest.mock('@defra/wls-database-model')

let models
let getPermissions
const applicationJson = 'application/json'

describe('The getPermissions handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getPermissions = (await import('../get-permissions-by-application-id.js')).default
  })

  it('returns a 200 on successful fetch', async () => {
    models.applications = {
      findByPk: jest.fn(() => ({ id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' }))
    }
    models.permissions = {
      findAll: jest.fn(async () => [{ dataValues: { id: 'bar', ...ts } }])
    }
    await getPermissions(context, { }, h)
    expect(h.response).toHaveBeenCalledWith([{ id: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 on application not found', async () => {
    models.applications = {
      findByPk: jest.fn(() => null)
    }
    await getPermissions(context, { }, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => null)
    models.applications = { findByPk: jest.fn(async () => { throw new Error() }) }
    await expect(async () => {
      await getPermissions(context, { }, h)
    }).rejects.toThrow()
  })
})
