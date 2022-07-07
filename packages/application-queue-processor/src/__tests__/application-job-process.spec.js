import { UnRecoverableBatchError, BaseKeyMapping } from '@defra/wls-powerapps-lib'

jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-connectors-lib')

jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ process: jest.fn })),
  queueDefinitions: { APPLICATION_QUEUE: {} }
}))

const applicationId = 'b1847e67-07fa-4c51-af03-cb51f5126939'

const job = {
  data: {
    applicationId
  }
}

describe('The application job processor', () => {
  beforeEach(() => jest.resetModules())
  afterAll(() => jest.clearAllMocks())

  describe('The buildApiObject function - creates a data and keys payload for the batch update process', () => {
    it('return null where no application is found', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: jest.fn(() => null) }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      const result = await buildApiObject(job.data.applicationId)
      expect(result).toBeNull()
    })

    it('correctly creates a application payload', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              application: { foo: 'bar' },
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationSites: { findAll: jest.fn(() => []) },
          applicationContacts: { findAll: jest.fn(() => []) },
          applicationAccounts: { findAll: jest.fn(() => []) }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      const payload = await buildApiObject(job.data.applicationId)
      expect(payload).toEqual({
        application: {
          data: { foo: 'bar' },
          keys: {
            apiKey: 'b1847e67-07fa-4c51-af03-cb51f5126939',
            sddsKey: 'b1847e67-07fa-4c51-af03-cb51f5126939'
          }
        }
      })
    })

    it('correctly creates a application payload with an applicant', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              application: { foo: 'bar' },
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationSites: { findAll: jest.fn(() => []) },
          applicationContacts: {
            findAll: jest.fn()
              .mockReturnValueOnce([{ contactId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb', contactRole: 'APPLICANT' }])
              .mockReturnValue([])
          },
          applicationAccounts: { findAll: jest.fn(() => []) },
          contacts: {
            findByPk: jest.fn(() => ({
              id: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
              sddsContactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
              contact: { name: 'contact 1' }
            }))
          }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      const payload = await buildApiObject(job.data.applicationId)
      expect(payload).toEqual(expect.objectContaining({
        application: {
          data: { foo: 'bar' },
          keys: {
            apiKey: 'b1847e67-07fa-4c51-af03-cb51f5126939',
            sddsKey: 'b1847e67-07fa-4c51-af03-cb51f5126939'
          },
          applicant: {
            data: { name: 'contact 1' },
            keys: {
              apiKey: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
              sddsKey: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
            }
          }
        }
      }
      ))
    })

    it('correctly creates a application payload with an ecologist', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              application: { foo: 'bar' },
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationSites: { findAll: jest.fn(() => []) },
          applicationContacts: {
            findAll: jest.fn()
              .mockReturnValueOnce([])
              .mockReturnValue([{ contactId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb', contactRole: 'ECOLOGIST' }])
          },
          applicationAccounts: { findAll: jest.fn(() => []) },
          contacts: {
            findByPk: jest.fn(() => ({
              id: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
              sddsContactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
              contact: { name: 'contact 1' }
            }))
          }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      const payload = await buildApiObject(job.data.applicationId)
      expect(payload).toEqual(expect.objectContaining({
        application: {
          data: { foo: 'bar' },
          keys: {
            apiKey: 'b1847e67-07fa-4c51-af03-cb51f5126939',
            sddsKey: 'b1847e67-07fa-4c51-af03-cb51f5126939'
          },
          ecologist: {
            data: { name: 'contact 1' },
            keys: {
              apiKey: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
              sddsKey: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
            }
          }
        }
      }
      ))
    })

    it('correctly creates a application payload with an applicant-organisation', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              application: { foo: 'bar' },
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationSites: { findAll: jest.fn(() => []) },
          applicationAccounts: {
            findAll: jest.fn()
              .mockReturnValueOnce([{ accountId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb', contactRole: 'APPLICANT-ORGANISATION' }])
              .mockReturnValue([])
          },
          applicationContacts: { findAll: jest.fn(() => []) },
          accounts: {
            findByPk: jest.fn(() => ({
              id: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
              sddsAccountId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
              account: { name: 'account 1' }
            }))
          }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      const payload = await buildApiObject(job.data.applicationId)
      expect(payload).toEqual(expect.objectContaining({
        application: {
          data: { foo: 'bar' },
          keys: {
            apiKey: 'b1847e67-07fa-4c51-af03-cb51f5126939',
            sddsKey: 'b1847e67-07fa-4c51-af03-cb51f5126939'
          },
          applicantOrganization: {
            data: { name: 'account 1' },
            keys: {
              apiKey: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
              sddsKey: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
            }
          }
        }
      }
      ))
    })

    it('correctly creates a application payload with an ecologist-organisation', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              application: { foo: 'bar' },
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationSites: { findAll: jest.fn(() => []) },
          applicationAccounts: {
            findAll: jest.fn()
              .mockReturnValueOnce([])
              .mockReturnValue([{ accountId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb', contactRole: 'ECOLOGIST-ORGANISATION' }])
          },
          applicationContacts: { findAll: jest.fn(() => []) },
          accounts: {
            findByPk: jest.fn(() => ({
              id: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
              sddsAccountId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
              account: { name: 'account 2' }
            }))
          }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      const payload = await buildApiObject(job.data.applicationId)
      expect(payload).toEqual(expect.objectContaining({
        application: {
          data: { foo: 'bar' },
          keys: {
            apiKey: 'b1847e67-07fa-4c51-af03-cb51f5126939',
            sddsKey: 'b1847e67-07fa-4c51-af03-cb51f5126939'
          },
          ecologistOrganization: {
            data: { name: 'account 2' },
            keys: {
              apiKey: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
              sddsKey: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
            }
          }
        }
      }
      ))
    })

    it('correctly creates an application with sites', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              application: { foo: 'bar' },
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationContacts: { findAll: jest.fn(() => []) },
          applicationAccounts: { findAll: jest.fn(() => []) },
          applicationSites: {
            findAll: jest.fn(() => [{
              id: '79015868-4149-420c-90f5-356dc2d06184',
              applicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              siteId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              sddsSiteId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
            }])
          },
          sites: {
            findAll: jest.fn(() => [{
              id: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
              site: { name: 'Site 1' },
              sddsSiteId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
            }])
          }
        }
      }))

      const { buildApiObject } = await import('../application-job-process.js')
      const payload = await buildApiObject(job.data.applicationId)
      expect(payload).toEqual(expect.objectContaining({
        application:
          {
            data: { foo: 'bar' },
            keys:
              {
                apiKey: 'b1847e67-07fa-4c51-af03-cb51f5126939',
                sddsKey: 'b1847e67-07fa-4c51-af03-cb51f5126939'
              },
            sites: [{
              data: { name: 'Site 1' },
              keys: {
                apiKey: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
                sddsKey: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
              }
            }]
          }
      }))
    })

    it('throws an error on bad data', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: jest.fn(() => { throw new Error() }) }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      await expect(buildApiObject(0)).rejects.toThrow()
    })
  })

  describe('The postProcess function - writes the response data back down into the database', () => {
    beforeAll(() => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        SEQUELIZE: { getSequelize: () => ({ fn: jest.fn() }) },
        POWERAPPS: { getClientUrl: jest.fn() }
      }))
    })

    it('Updates correctly when passed the set of target keys', async () => {
      const mockApplicationsUpdate = jest.fn(() => {})
      const mockContactsUpdate = jest.fn(() => {})
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { update: mockApplicationsUpdate },
          contacts: { update: mockContactsUpdate }
        }
      }))

      const { postProcess } = await import('../application-job-process.js')
      await postProcess([{
        apiTableName: 'contacts',
        keys: {
          apiKey: '656f6707-13e3-459d-8f1e-b1b30df79c09',
          sddsKey: 'f59e6275-adf7-ec11-82e6-002248c5c17e'
        }
      },
      {
        apiTableName: 'applications',
        keys: {
          apiKey: 'e8fa7a0d-d8dd-4016-9ef3-1503bbffc059',
          sddsKey: '64f65a7b-adf7-ec11-82e6-002248c5c17e'
        }
      }
      ])
      expect(mockApplicationsUpdate).toHaveBeenCalledWith(expect.objectContaining({
        sddsApplicationId: '64f65a7b-adf7-ec11-82e6-002248c5c17e',
        updateStatus: 'P'
      }), { where: { id: 'e8fa7a0d-d8dd-4016-9ef3-1503bbffc059' } })
      expect(mockContactsUpdate).toHaveBeenCalledWith(expect.objectContaining({
        sddsContactId: 'f59e6275-adf7-ec11-82e6-002248c5c17e',
        updateStatus: 'P'
      }), { where: { id: '656f6707-13e3-459d-8f1e-b1b30df79c09' } })
    })

    it('throws an error on bad data', async () => {
      const { postProcess } = await import('../application-job-process.js')
      await expect(postProcess(0)).rejects.toThrow()
    })
  })

  describe('The applicationJobProcess function - calls the update process and handles errors', () => {
    beforeAll(() => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        SEQUELIZE: { getSequelize: () => ({ fn: jest.fn() }) },
        POWERAPPS: { getClientUrl: jest.fn() }
      }))
    })

    it('Resolves when no error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({
        applicationUpdate: jest.fn(() => [{
          apiTableName: 'contacts',
          keys: {
            apiKey: '656f6707-13e3-459d-8f1e-b1b30df79c09',
            sddsKey: 'f59e6275-adf7-ec11-82e6-002248c5c17e'
          }
        }]),
        BaseKeyMapping: BaseKeyMapping
      }))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              application: { foo: 'bar' },
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationContacts: {
            findAll: jest.fn(() => [{
              contactId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732'
            }])
          },
          contacts: {
            findByPk: jest.fn(() => ({
              id: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
              contact: { foo: 'bar' },
              sddsContactId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationSites: {
            findAll: jest.fn(() => [])
          }
        }
      }))
      const { applicationJobProcess } = await import('../application-job-process.js')
      await expect(() => applicationJobProcess(job)).resolves
    })

    it('Resolves where no application found in database', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({
        applicationUpdate: jest.fn(),
        BaseKeyMapping: BaseKeyMapping
      }))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: jest.fn(() => null) }
        }
      }))
      const { applicationJobProcess } = await import('../application-job-process.js')
      await expect(applicationJobProcess(job)).resolves
    })

    it('Logs error and resolves with unrecoverable error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => {
        return {
          UnRecoverableBatchError: UnRecoverableBatchError,
          applicationUpdate: jest.fn(() => { throw new UnRecoverableBatchError() }),
          BaseKeyMapping: BaseKeyMapping
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              application: { foo: 'bar' },
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationSites: { findAll: jest.fn(() => []) },
          applicationContacts: { findAll: jest.fn(() => []) },
          applicationAccounts: { findAll: jest.fn(() => []) }
        }
      }))
      const { applicationJobProcess } = await import('../application-job-process.js')
      await expect(applicationJobProcess(job)).resolves
    })

    it('Reject with recoverable error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => {
        return {
          UnRecoverableBatchError: UnRecoverableBatchError,
          applicationUpdate: jest.fn(() => { throw new Error() }),
          BaseKeyMapping: BaseKeyMapping
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              application: { foo: 'bar' },
              sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          },
          applicationSites: { findAll: jest.fn(() => []) },
          applicationContacts: { findAll: jest.fn(() => []) },
          applicationAccounts: { findAll: jest.fn(() => []) }
        }
      }))
      const { applicationJobProcess } = await import('../application-job-process.js')
      await expect(applicationJobProcess(job)).rejects.toThrow()
    })
  })
})
