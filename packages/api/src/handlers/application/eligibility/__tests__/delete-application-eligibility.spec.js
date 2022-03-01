const path = 'user/uuid/application/uuid/eligibility'
const req = {
  path,
  payload: {
    isOwnerOfLand: true,
    permissionsGranted: false,
    permissionsRequired: false,
    hasLandOwnerPermission: true
  }
}

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
      applicationId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
    }
  }
}

const a = {
  firstname: 'g', lastname: 'b'
}

jest.mock('@defra/wls-database-model')

let models
let deleteApplicationEligibility
let cache
const applicationJson = 'application/json'

describe('The putApplicationeEligibility handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    deleteApplicationEligibility = (await import('../eligibility.js')).deleteApplicationEligibility
    cache = (await import('../../../../services/cache.js')).cache
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')
    SEQUELIZE.getSequelize = jest.fn(() => ({
      query: jest.fn(() => ({})),
      QueryTypes: {
        UPDATE: 'update'
      }
    }))
  })

  it('returns status 200 on a successful update', async () => {
    cache.delete = jest.fn()
    models.applications = {
      findByPk: jest.fn(() => ({
        dataValues: { application: { eligibility: a } }
      }))
    }
    cache.restore = jest.fn(() => null)
    await deleteApplicationEligibility(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns status 404 on not found', async () => {
    cache.delete = jest.fn()
    models.applications = { findByPk: jest.fn(() => null) }
    await deleteApplicationEligibility(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on a database error', async () => {
    cache.delete = jest.fn()
    models.applications = { findByPk: () => { throw Error() } }
    await expect(async () => {
      await deleteApplicationEligibility(context, req, h)
    }).rejects.toThrow()
  })
})
