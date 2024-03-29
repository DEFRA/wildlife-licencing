const keys = [
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'application',
    powerAppsTable: 'sdds_applications',
    contentId: null,
    powerAppsKey: 'fc1a9675-db01-ed11-82e5-002248c5c45b'
  },
  {
    apiTable: 'accounts',
    apiKey: null,
    apiBasePath: 'application.applicantOrganization',
    powerAppsTable: 'accounts',
    contentId: null,
    powerAppsKey: '9dd69d6f-db01-ed11-82e5-002248c5c45b'
  },
  {
    apiTable: 'accounts',
    apiKey: null,
    apiBasePath: 'application.ecologistOrganization',
    powerAppsTable: 'accounts',
    contentId: null,
    powerAppsKey: '9fd69d6f-db01-ed11-82e5-002248c5c45b'
  },
  {
    apiTable: 'accounts',
    apiKey: null,
    apiBasePath: 'application.payerOrganization',
    powerAppsTable: 'accounts',
    contentId: null,
    powerAppsKey: '6fd69d6f-db01-ed11-82e5-002248c5c45b'
  }
]

describe('The application-account extract processor: write-application-account-object', () => {
  beforeEach(() => jest.resetModules())

  it('creates an application applicant-organisation', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        accounts: {
          findOne: jest.fn()
            .mockReturnValueOnce({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })
            .mockReturnValueOnce(null)
            .mockReturnValueOnce(null)
        },
        applicationAccounts: {
          findOne: jest.fn(() => null),
          create: mockCreate
        }
      }
    }))
    const { writeApplicationAccountObject } = await import('../write-application-account-object.js')
    const result = await writeApplicationAccountObject({ data: {}, keys })
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      applicationId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
      accountId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
      accountRole: 'APPLICANT-ORGANISATION'
    })
  })

  it('creates an application ecologist-organisation', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        accounts: {
          findOne: jest.fn()
            .mockReturnValueOnce(null)
            .mockReturnValueOnce({ id: '96013271-b969-4ef4-871e-41471eaaabda' })
            .mockReturnValueOnce(null)
        },
        applicationAccounts: {
          findOne: jest.fn(() => null),
          create: mockCreate
        }
      }
    }))
    const { writeApplicationAccountObject } = await import('../write-application-account-object.js')
    const result = await writeApplicationAccountObject({ data: {}, keys })
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      applicationId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
      accountId: '96013271-b969-4ef4-871e-41471eaaabda',
      accountRole: 'ECOLOGIST-ORGANISATION'
    })
  })

  it('creates an application payer-organisation', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        accounts: {
          findOne: jest.fn()
            .mockReturnValueOnce(null)
            .mockReturnValueOnce(null)
            .mockReturnValue({ id: '96013271-b969-4ef4-871e-41471eaaabda' })
        },
        applicationAccounts: {
          findOne: jest.fn(() => null),
          create: mockCreate
        }
      }
    }))
    const { writeApplicationAccountObject } = await import('../write-application-account-object.js')
    const result = await writeApplicationAccountObject({ data: {}, keys })
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      applicationId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
      accountId: '96013271-b969-4ef4-871e-41471eaaabda',
      accountRole: 'PAYER-ORGANISATION'
    })
  })

  it('ignores an application applicant-organisation if the relation exists', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        accounts: {
          findOne: jest.fn()
            .mockReturnValueOnce({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })
            .mockReturnValue(null)
        },
        applicationAccounts: {
          findOne: jest.fn(() => ({})),
          create: mockCreate
        }
      }
    }))
    const { writeApplicationAccountObject } = await import('../write-application-account-object.js')
    const result = await writeApplicationAccountObject({ data: {}, keys })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
    expect(mockCreate).not.toHaveBeenCalledWith()
  })

  it('ignores an application ecologist-organisation if the relation exists', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        accounts: {
          findOne: jest.fn()
            .mockReturnValueOnce(null)
            .mockReturnValue({ id: '96013271-b969-4ef4-871e-41471eaaabda' })
        },
        applicationAccounts: {
          findOne: jest.fn(() => ({})),
          create: mockCreate
        }
      }
    }))
    const { writeApplicationAccountObject } = await import('../write-application-account-object.js')
    const result = await writeApplicationAccountObject({ data: {}, keys })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('ignores an account does not exist', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        accounts: {
          findOne: jest.fn()
            .mockReturnValueOnce(null)
            .mockReturnValue(null)
        }
      }
    }))
    const { writeApplicationAccountObject } = await import('../write-application-account-object.js')
    const result = await writeApplicationAccountObject({ data: {}, keys })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
    expect(mockCreate).not.toHaveBeenCalledWith()
  })

  it('ignores if the application does not exist', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => null)
        }
      }
    }))
    const { writeApplicationAccountObject } = await import('../write-application-account-object.js')
    const result = await writeApplicationAccountObject({ data: {}, keys })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
    expect(mockCreate).not.toHaveBeenCalledWith()
  })

  it('records an error on an exception', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const { writeApplicationAccountObject } = await import('../write-application-account-object.js')
    const result = await writeApplicationAccountObject({ data: {}, keys })
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
