jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = '/licence/uuid/return'
const req = {
  path
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
const context = {
  request: {
    params: {
      returnId: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
      licenceId: '7c3b13ef-c2fb-4955-942e-764593cf0ada'
    }
  }
}

const applicationJson = 'application/json'

describe('The getReturn handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 200 on successful fetch', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave
        }
      }
    }))

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: () => ({
            dataValues: {
              id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
              licenceId: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
              whyNil: 'string',
              outcome: true,
              nilReturn: true,
              completedWithinLicenceDates: true,
              whyNotCompletedWithinLicenceDates: 'string',
              destroyVacantSettByMechanicalMeans: true,
              ...ts
            }
          })
        }
      }
    }))

    const getReturn = (await import('../get-return.js')).default
    await getReturn(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
      completedWithinLicenceDates: true,
      destroyVacantSettByMechanicalMeans: true,
      nilReturn: true,
      outcome: true,
      whyNil: 'string',
      whyNotCompletedWithinLicenceDates: 'string',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(mockSave).toHaveBeenCalledWith('/licence/uuid/return', expect.objectContaining({ completedWithinLicenceDates: true }))
  })

  it('returns a 404 on return not found (no return)', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: () => null
        }
      }
    }))
    const getReturn = (await import('../get-return.js')).default
    await getReturn(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 404 on return not found (wrong licence)', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: () => ({
            dataValues: {
              id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
              licenceId: '8c3b13ef-c2fb-4955-942e-764593cf0ada'
            }
          })
        }
      }
    }))
    const getReturn = (await import('../get-return.js')).default
    await getReturn(context, req, h)
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
    const getReturn = (await import('../get-return.js')).default
    await expect(async () => {
      await getReturn(context, req, h)
    }).rejects.toThrow()
  })
})
