const data = {
  application: {
    id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
    applicant: {
      contactId: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
    },
    ecologist: {
      contactId: '96013271-b969-4ef4-871e-41471eaaabda'
    }
  }
}

describe('The application-contact extract processor: write-application-contact-object', () => {
  beforeEach(() => jest.resetModules())

  it('creates an application applicant', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        contacts: {
          findOne: jest.fn()
            .mockReturnValueOnce({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })
            .mockReturnValue(null)
        },
        applicationContacts: {
          findOne: jest.fn(() => null),
          create: mockCreate
        }
      }
    }))
    const { writeApplicationContactObject } = await import('../write-application-contact-object.js')
    const result = await writeApplicationContactObject({ data }, new Date())
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      applicationId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
      contactId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
      contactRole: 'APPLICANT'
    })
  })

  it('creates an application ecologist', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        contacts: {
          findOne: jest.fn()
            .mockReturnValueOnce(null)
            .mockReturnValue({ id: '96013271-b969-4ef4-871e-41471eaaabda' })
        },
        applicationContacts: {
          findOne: jest.fn(() => null),
          create: mockCreate
        }
      }
    }))
    const { writeApplicationContactObject } = await import('../write-application-contact-object.js')
    const result = await writeApplicationContactObject({ data }, new Date())
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      applicationId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
      contactId: '96013271-b969-4ef4-871e-41471eaaabda',
      contactRole: 'ECOLOGIST'
    })
  })

  it('ignores an application applicant if the relation exists', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        contacts: {
          findOne: jest.fn()
            .mockReturnValueOnce({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })
            .mockReturnValue(null)
        },
        applicationContacts: {
          findOne: jest.fn(() => ({})),
          create: mockCreate
        }
      }
    }))
    const { writeApplicationContactObject } = await import('../write-application-contact-object.js')
    const result = await writeApplicationContactObject({ data }, new Date())
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
    expect(mockCreate).not.toHaveBeenCalledWith()
  })

  it('ignores an application ecologist if the relation exists', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        contacts: {
          findOne: jest.fn()
            .mockReturnValueOnce(null)
            .mockReturnValue({ id: '96013271-b969-4ef4-871e-41471eaaabda' })
        },
        applicationContacts: {
          findOne: jest.fn(() => ({})),
          create: mockCreate
        }
      }
    }))
    const { writeApplicationContactObject } = await import('../write-application-contact-object.js')
    const result = await writeApplicationContactObject({ data }, new Date())
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('ignores an contact does not exist', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findOne: jest.fn(() => ({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' }))
        },
        contacts: {
          findOne: jest.fn()
            .mockReturnValueOnce(null)
            .mockReturnValue(null)
        }
      }
    }))
    const { writeApplicationContactObject } = await import('../write-application-contact-object.js')
    const result = await writeApplicationContactObject({ data }, new Date())
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
    const { writeApplicationContactObject } = await import('../write-application-contact-object.js')
    const result = await writeApplicationContactObject({ data }, new Date())
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
    const { writeApplicationContactObject } = await import('../write-application-contact-object.js')
    const result = await writeApplicationContactObject({ data }, new Date())
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
