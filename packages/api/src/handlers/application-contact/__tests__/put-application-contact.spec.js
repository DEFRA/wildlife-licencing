/*
 * Mock the hapi request object
 */
const path = 'application-contact/1e470963-e8bf-41f5-9b0b-52d19c21cb78'
const req = {
  path,
  payload: {
    contactId: '324b293c-a184-4cca-a2d7-2d1ac14e367e',
    applicationId: 'e8387a83-1165-42e6-afab-add01e77bc4c',
    contactRole: 'APPLICANT'
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
      applicationContactId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
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

describe('The putApplicationContact handler', () => {
  beforeEach(() => { jest.resetModules() })

  it('returns a 400 on application not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    const putApplicationContact = (await import('../put-application-contact.js')).default
    await putApplicationContact(context, req, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('returns a 400 on contact not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({ id: '1ee0737e-f97d-4f79-8225-81b6014ce37e' }))
        },
        contacts: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    const putApplicationContact = (await import('../put-application-contact.js')).default
    await putApplicationContact(context, req, h)
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
          contactId: '324b293c-a184-4cca-a2d7-2d1ac14e367e',
          applicationId: 'e8387a83-1165-42e6-afab-add01e77bc4c',
          contactRole: 'APPLICANT',
          ...ts
        }
    }, true]))

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({ id: '1ee0737e-f97d-4f79-8225-81b6014ce37e' }))
        },
        contacts: {
          findByPk: jest.fn(() => ({ id: '1ee0737e-f97d-4f79-8225-81b6014ce37e' }))
        },
        applicationContacts: {
          findOrCreate: mockFindOrCreate
        }
      }
    }))
    const putApplicationContact = (await import('../put-application-contact.js')).default
    await putApplicationContact(context, req, h)
    expect(mockFindOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: expect.any(String),
        updateStatus: 'L',
        ...req.payload
      },
      where: {
        id: context.request.params.applicationContactId
      }
    })
    expect(mockSave).toHaveBeenCalledWith('application-contact/1e470963-e8bf-41f5-9b0b-52d19c21cb78', {
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
      contactId: '324b293c-a184-4cca-a2d7-2d1ac14e367e',
      applicationId: 'e8387a83-1165-42e6-afab-add01e77bc4c',
      contactRole: 'APPLICANT',
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
      applicationId: 'e8387a83-1165-42e6-afab-add01e77bc4c',
      contactId: '324b293c-a184-4cca-a2d7-2d1ac14e367e',
      contactRole: 'APPLICANT',
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
    const putApplicationContact = (await import('../put-application-contact.js')).default
    await expect(async () => {
      await putApplicationContact(context, req, h)
    }).rejects.toThrow()
  })
})
