const path = 'user/uuid/application/uuid/applicant'
const req = {
  path,
  payload: {
    sddsId: '1e470963-e8bf-41f5-9b0b-52d19c21cb79',
    proposalDescription: 'a proposal',
    detailsOfConvictions: 'convictions'
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

jest.mock('../../../../model/sequentelize-model.js')

let models
let getApplicationApplicant
let cache
const applicationJson = 'application/json'

const a = {
  firstname: 'g', lastname: 'b'
}

describe('The putApplicationApplicant handler', () => {
  beforeAll(async () => {
    models = (await import('../../../../../../database-model/src/sequentelize-model.js')).models
    getApplicationApplicant = (await import('../get-application-applicant.js')).default
    cache = (await import('../../../../services/cache.js')).cache
  })

  it('returns status 200 on a successful get from cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify(a))
    await getApplicationApplicant(context, req, h)
    expect(h.response).toHaveBeenCalledWith(a)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns status 200 on a successful get from db', async () => {
    models.applications = {
      findByPk: jest.fn(() => ({
        dataValues: { application: { applicant: a } }
      }))
    }
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    await getApplicationApplicant(context, req, h)
    expect(models.applications.findByPk).toHaveBeenCalledWith(context.request.params.applicationId)
    expect(cache.save).toHaveBeenCalledWith(path, a)
    expect(h.response).toHaveBeenCalledWith(a)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns status 404 when not found', async () => {
    cache.restore = jest.fn(() => null)
    models.applications = {
      findByPk: jest.fn(() => null)
    }
    await getApplicationApplicant(context, req, h)
    expect(models.applications.findByPk).toHaveBeenCalledWith(context.request.params.applicationId)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on a database error', async () => {
    models.applications = {
      findByPk: jest.fn(() => { throw new Error() })
    }
    cache.restore = jest.fn(() => null)
    await expect(async () => {
      await getApplicationApplicant(context, req, h)
    }).rejects.toThrow()
  })
})
