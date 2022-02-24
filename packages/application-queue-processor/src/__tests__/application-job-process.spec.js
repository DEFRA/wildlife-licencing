import { UnRecoverableBatchError, BaseKeyMapping } from '@defra/wls-powerapps-lib'

jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-connectors-lib')

jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ process: jest.fn })),
  queueDefinitions: { APPLICATION_QUEUE: {} }
}))

const userId = '903ecac0-f4cb-4fd8-a853-557a02ddde0c'
const siteId = '883feb82-dd3c-461b-a8c2-4ce47cfb4d6a'
const applicationId = 'b1847e67-07fa-4c51-af03-cb51f5126939'

const job = {
  data: {
    userId, applicationId
  }
}

const applicationResultInitial = {
  dataValues: {
    id: applicationId,
    userId: userId,
    application: { foo: 'bar' },
    targetKeys: null,
    sddsApplicationId: null,
    submitted: null
  }
}

const applicationSitesResultInitial = [{
  dataValues: {
    id: '79015868-4149-420c-90f5-356dc2d06184',
    userId: userId,
    applicationId: applicationId,
    siteId: siteId,
    sddsApplicationId: null,
    sddsSiteId: null
  }
}]

const sitesResultInitial = [{
  dataValues: {
    id: siteId,
    userId: userId,
    site: { foo: 'bar2' },
    targetKeys: null,
    sddsSiteId: null
  }
}]

const applicationKeys = [
  {
    apiKey: applicationResultInitial.dataValues.id,
    apiTable: 'applications',
    powerAppsKey: '2b6759f9-268f-ec11-b400-000d3a8728b2',
    powerAppsTable: 'sdds_applications'
  },
  {
    apiKey: null,
    apiTable: 'applications',
    powerAppsKey: '296759f9-268f-ec11-b400-000d3a8728b2',
    powerAppsTable: 'contacts'
  }
]

const siteKey = {
  apiKey: sitesResultInitial[0].dataValues.id,
  apiTable: 'sites',
  powerAppsKey: '286759f9-268f-ec11-b400-000d3a8728b2',
  powerAppsTable: 'sdds_sites'
}

const targetKeyResponse = [
  {
    apiTable: 'applications',
    apiKey: '4fd6f85a-10bf-4bef-be97-d9737e1bc381',
    apiBasePath: 'application',
    powerAppsTable: 'sdds_applications',
    contentId: 3,
    powerAppsKey: '7ca97d43-0390-ec11-b400-000d3a872ae7'
  },
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'application.applicant',
    powerAppsTable: 'contacts',
    contentId: 2,
    powerAppsKey: '2f9216b9-0990-ec11-b400-000d3a8728b2'
  }, {
    apiTable: 'sites',
    apiKey: 'f4ee294d-2c94-4868-93c3-80467a737f7b',
    apiBasePath: 'application.sites',
    powerAppsTable: 'sdds_sites',
    contentId: 1,
    powerAppsKey: 'ad748889-0390-ec11-b400-000d3a8728b2'
  }
]

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
      const result = await buildApiObject(job.data.userId, job.data.applicationId)
      expect(result).toBeNull()
    })

    it('correctly creates a simple application with no sites and no keys', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: jest.fn(() => applicationResultInitial) },
          applicationSites: { findAll: jest.fn(() => []) }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      const { data, keys } = await buildApiObject(job.data.userId, job.data.applicationId)
      expect(data).toEqual({ application: { id: job.data.applicationId, foo: 'bar' } })
      const expectedKeys = [{ apiKey: job.data.applicationId, apiTable: 'applications', apiBasePath: 'application', powerAppsTable: 'sdds_applications' }]
      expect(keys).toEqual(expectedKeys)
    })

    it('correctly creates an application with sites and no keys', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: jest.fn(() => applicationResultInitial) },
          applicationSites: { findAll: jest.fn(() => applicationSitesResultInitial) },
          sites: { findAll: jest.fn(() => sitesResultInitial) }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      const { data, keys } = await buildApiObject(job.data.userId, job.data.applicationId)
      expect(data).toEqual({
        application: {
          id: job.data.applicationId,
          foo: 'bar',
          sites: [{ id: siteId, foo: 'bar2' }]
        }
      })
      const expectedKeys = [
        { apiKey: job.data.applicationId, apiTable: 'applications', apiBasePath: 'application', powerAppsTable: 'sdds_applications' },
        { apiKey: siteId, apiTable: 'sites', apiBasePath: 'application.sites', powerAppsTable: 'sdds_sites' }
      ]
      expect(keys).toEqual(expectedKeys)
    })

    it('correctly creates an application with sites and keys', async () => {
      const applicationResultKeys = Object.assign({}, applicationResultInitial)
      applicationResultKeys.dataValues.targetKeys = applicationKeys
      const sitesResultKeys = Object.assign([], sitesResultInitial)
      sitesResultKeys[0].dataValues.targetKeys = siteKey
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: jest.fn(() => applicationResultKeys) },
          applicationSites: { findAll: jest.fn(() => applicationSitesResultInitial) },
          sites: { findAll: jest.fn(() => sitesResultKeys) }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      const { keys } = await buildApiObject(job.data.userId, job.data.applicationId)
      const expectedKeys = [
        {
          apiKey: applicationId,
          apiTable: 'applications',
          powerAppsKey: '2b6759f9-268f-ec11-b400-000d3a8728b2',
          powerAppsTable: 'sdds_applications'
        },
        {
          apiKey: null,
          apiTable: 'applications',
          powerAppsKey: '296759f9-268f-ec11-b400-000d3a8728b2',
          powerAppsTable: 'contacts'
        },
        {
          apiKey: siteId,
          apiTable: 'sites',
          powerAppsKey: '286759f9-268f-ec11-b400-000d3a8728b2',
          powerAppsTable: 'sdds_sites'
        }
      ]
      expect(keys).toEqual(expectedKeys)
    })

    it('throws an error on bad data', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: jest.fn(() => { throw new Error() }) }
        }
      }))
      const { buildApiObject } = await import('../application-job-process.js')
      await expect(async () => await buildApiObject(0, 0)).rejects.toThrow()
    })
  })

  describe('The postProcess function - writes the response data back down into the database', () => {
    beforeAll(() => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        SEQUELIZE: { getSequelize: () => ({ fn: jest.fn() }) },
        POWERAPPS: { getClientUrl: jest.fn() }
      }))
    })

    it('Updates normally when passed a set of target keys', async () => {
      const mockApplicationsUpdate = jest.fn(() => {})
      const mockApplicationSitesUpdate = jest.fn(() => {})
      const mockSitesUpdate = jest.fn(() => {})
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { update: mockApplicationsUpdate },
          sites: { update: mockSitesUpdate },
          applicationSites: { update: mockApplicationSitesUpdate }
        }
      }))

      const { postProcess } = await import('../application-job-process.js')
      await postProcess(targetKeyResponse)
      expect(mockApplicationsUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          sddsApplicationId: '7ca97d43-0390-ec11-b400-000d3a872ae7',
          targetKeys: [
            expect.objectContaining({ powerAppsKey: targetKeyResponse[0].powerAppsKey }),
            expect.objectContaining({ powerAppsKey: targetKeyResponse[1].powerAppsKey })
          ]
        }),
        expect.objectContaining({ where: { id: targetKeyResponse[0].apiKey } }))
      expect(mockApplicationSitesUpdate).toHaveBeenCalledWith({
        sddsApplicationId: targetKeyResponse[0].powerAppsKey,
        sddsSiteId: targetKeyResponse[2].powerAppsKey
      }, {
        where: {
          applicationId: targetKeyResponse[0].apiKey,
          siteId: targetKeyResponse[2].apiKey
        }
      })
      expect(mockSitesUpdate).toHaveBeenCalledWith(expect.objectContaining({
        sddsSiteId: targetKeyResponse[2].powerAppsKey,
        targetKeys: expect.objectContaining({
          apiKey: targetKeyResponse[2].apiKey,
          powerAppsTable: 'sdds_sites'
        })
      }), {
        where: {
          id: targetKeyResponse[2].apiKey
        }
      })
    })

    it('throws an error on bad data', async () => {
      const { postProcess } = await import('../application-job-process.js')
      await expect(async () => await postProcess(0)).rejects.toThrow()
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
        applicationUpdate: jest.fn(() => targetKeyResponse),
        BaseKeyMapping: BaseKeyMapping
      }))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: jest.fn(() => applicationResultInitial), update: jest.fn() },
          applicationSites: { findAll: jest.fn(() => []), update: jest.fn() },
          sites: { update: jest.fn() }
        }
      }))
      const { applicationJobProcess } = await import('../application-job-process.js')
      await expect(applicationJobProcess(job)).resolves
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
          applications: { findByPk: jest.fn(() => applicationResultInitial) },
          applicationSites: { findAll: jest.fn(() => []) }
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
          applications: { findByPk: jest.fn(() => applicationResultInitial) },
          applicationSites: { findAll: jest.fn(() => []) }
        }
      }))
      const { applicationJobProcess } = await import('../application-job-process.js')
      await expect(applicationJobProcess(job)).rejects.toThrow()
    })
  })
})
