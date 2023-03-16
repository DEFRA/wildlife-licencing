jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = '/application/uuid/designated-site'
const req = {
  path,
  payload: {
    completedWithinLicenceDates: true
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
const context = { request: { params: { licenceId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' } } }

const applicationJson = 'application/json'

describe('The getReturnsByLicenceId handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 200 on successful fetch', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => ({ id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' })
        },
        returns: {
          findAll: () => [
            {
              dataValues: {
                id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
                whyNil: 'string',
                outcome: true,
                nilReturn: true,
                completedWithinLicenceDates: true,
                whyNotCompletedWithinLicenceDates: 'string',
                destroyVacantSettByMechanicalMeans: true,
                ...ts
              }
            }
          ]
        }
      }
    }))

    const getReturnsByLicenceId = (await import('../get-returns-by-licence-id.js')).default
    await getReturnsByLicenceId(context, req, h)
    expect(h.response).toHaveBeenCalledWith([{
      id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
      completedWithinLicenceDates: true,
      destroyVacantSettByMechanicalMeans: true,
      nilReturn: true,
      outcome: true,
      whyNil: 'string',
      whyNotCompletedWithinLicenceDates: 'string',
      ...tsR
    }]
    )
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 on licence not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => null
        }
      }
    }))
    const getReturnsByLicenceId = (await import('../get-returns-by-licence-id.js')).default
    await getReturnsByLicenceId(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => { throw new Error() }
        }
      }
    }))
    const getReturnsByLicenceId = (await import('../get-returns-by-licence-id.js')).default
    await expect(async () => {
      await getReturnsByLicenceId(context, req, h)
    }).rejects.toThrow()
  })
})
