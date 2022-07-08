/*
 * Mock the hapi request object
 */
const path = 'application-account/1e470963-e8bf-41f5-9b0b-52d19c21cb78'
const req = {
  path,
  payload: {
    accountId: '324b293c-a184-4cca-a2d7-2d1ac14e367e',
    applicationId: 'e8387a83-1165-42e6-afab-add01e77bc4c',
    accountRole: 'APPLICANT'
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
      applicationAccountId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
    }
  }
}

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

const applicationJson = 'application/json'

describe('The putApplicationAccount handler', () => {
  beforeEach(() => { jest.resetModules() })

  it('returns a 400 on application not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    const putApplicationAccount = (await import('../put-application-account.js')).default
    await putApplicationAccount(context, req, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('returns a 400 on account not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({ id: '1ee0737e-f97d-4f79-8225-81b6014ce37e' }))
        },
        accounts: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    const putApplicationAccount = (await import('../put-application-account.js')).default
    await putApplicationAccount(context, req, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('returns a 201 on successful create', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave
        }
      }
    }))
    const mockFindOrCreate = jest.fn(async () => ([{
      dataValues:
        {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
          accountId: '324b293c-a184-4cca-a2d7-2d1ac14e367e',
          applicationId: 'e8387a83-1165-42e6-afab-add01e77bc4c',
          accountRole: 'APPLICANT',
          ...ts
        }
    }, true]))

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({ id: '1ee0737e-f97d-4f79-8225-81b6014ce37e' }))
        },
        accounts: {
          findByPk: jest.fn(() => ({ id: '1ee0737e-f97d-4f79-8225-81b6014ce37e' }))
        },
        applicationAccounts: {
          findOrCreate: mockFindOrCreate
        }
      }
    }))
    const putApplicationAccount = (await import('../put-application-account.js')).default
    await putApplicationAccount(context, req, h)
    expect(mockFindOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: expect.any(String),
        updateStatus: 'L',
        ...req.payload
      },
      where: {
        id: context.request.params.applicationAccountId
      }
    })
    expect(mockSave).toHaveBeenCalledWith('application-account/1e470963-e8bf-41f5-9b0b-52d19c21cb78', {
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
      accountId: '324b293c-a184-4cca-a2d7-2d1ac14e367e',
      applicationId: 'e8387a83-1165-42e6-afab-add01e77bc4c',
      accountRole: 'APPLICANT',
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
      applicationId: 'e8387a83-1165-42e6-afab-add01e77bc4c',
      accountId: '324b293c-a184-4cca-a2d7-2d1ac14e367e',
      accountRole: 'APPLICANT',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('throws with an update query error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const putApplicationAccount = (await import('../put-application-account.js')).default
    await expect(async () => {
      await putApplicationAccount(context, req, h)
    }).rejects.toThrow()
  })
})
