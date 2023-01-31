/*
 * Mock the hapi request object
 */

const path = '/application/uuid/permission'
const req = {
  path,
  payload: { referenceNumber: '123' }
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
const context = { request: { params: { applicationId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' } } }

jest.mock('@defra/wls-database-model')

let models
let postPermission
let cache
const applicationJson = 'application/json'

describe('The postPermission handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    postPermission = (await import('../post-permission.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.applications = {
      findByPk: jest.fn(() => ({
        id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77'
      }))
    }
    models.permissions = {
      create: jest.fn(async () => ({ dataValues: { id: 'bar', ...ts } }))
    }
    cache.save = jest.fn(() => null)
    await postPermission(context, req, h)
    expect(models.permissions.create).toHaveBeenCalledWith({
      id: expect.any(String),
      applicationId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77',
      updateStatus: 'L',
      permission: {
        referenceNumber: '123'
      }
    })
    expect(cache.save).toHaveBeenCalledWith('/application/1e470963-e8bf-41f5-9b0b-52d19c21cb77/permission/bar', { id: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 404 on application not found', async () => {
    models.applications = {
      findByPk: jest.fn(() => null)
    }
    cache.delete = jest.fn()
    await postPermission(context, req, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => null)
    cache.save = jest.fn(() => null)
    cache.delete = jest.fn(() => null)
    models.applications = { findByPk: jest.fn(async () => { throw new Error() }) }
    await expect(async () => {
      await postPermission(context, req, h)
    }).rejects.toThrow()
  })
})
