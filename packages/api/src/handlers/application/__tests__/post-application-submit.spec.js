jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */

const path = 'user/uuid/application/uuid/submit'
const req = { path }

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      userId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77',
      applicationId: 'f8c8c4bf-724b-4c25-934f-d1e7de1e2980'
    }
  }
}

jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ add: jest.fn(() => ({ id: 1 })) })),
  queueDefinitions: { APPLICATION_QUEUE: {}, FILE_QUEUE: {} }
}))

let models
let postApplicationSubmit
let cache

describe('The postApplicationSubmit handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    postApplicationSubmit = (await import('../post-application-submit.js')).default
    const { SEQUELIZE, REDIS } = (await import('@defra/wls-connectors-lib'))
    cache = REDIS.cache
    SEQUELIZE.getSequelize = () => ({ fn: jest.fn().mockImplementation(() => new Date('October 13, 2023 11:13:00')) })
  })

  it('returns a 204 on a successful submission', async () => {
    const mockUpdate = jest.fn()
    models.applications = {
      findByPk: jest.fn(async () => ({ dataValues: { id: 'bar', userId: 'foo' } })),
      update: mockUpdate
    }
    models.applicationUploads = {
      findAll: jest.fn(async () => [{ dataValues: { id: '123' } }])
    }
    cache.delete = jest.fn(() => null)
    await postApplicationSubmit(context, req, h)

    expect(cache.delete).toHaveBeenCalledWith(`/application/${context.request.params.applicationId}`)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(204)
    expect(mockUpdate).toHaveBeenCalledWith({
      userSubmission: new Date('October 13, 2023 11:13:00')
    }, expect.any(Object))
  })

  it('returns a 404 on not found', async () => {
    models.applications = { findByPk: jest.fn(async () => null) }
    await postApplicationSubmit(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with a query error', async () => {
    models.applications = { findByPk: jest.fn(async () => { throw new Error() }) }
    cache.delete = jest.fn(() => null)
    await expect(async () => postApplicationSubmit(context, req, h)).rejects.toThrowError()
  })
})
