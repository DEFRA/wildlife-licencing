import { UnRecoverableBatchError } from '@defra/wls-powerapps-lib'

jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-connectors-lib')

jest.spyOn(console, 'error').mockImplementation(() => null)

const APPLICATION = {
  id: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
  sddsApplicationId: '510db545-4136-48c4-9680-98d89d3962e7'
}

const APPLICANT_1 = {
  id: '0d5509a8-48d8-4026-961f-a19918dfc28b',
  sddsContactId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
  userId: null
}

const APPLICATION_APPLICANT_1 = {
  id: '78dfccad-c05f-449f-91eb-82966669e56d',
  applicationId: APPLICATION.id,
  contactId: APPLICANT_1.id,
  contactRole: 'APPLICANT'
}

const APPLICANT_ORGANISATION_1 = {
  id: '1c78476d-5263-4dde-9733-7149df755faa',
  sddsAccountId: '8dc10626-c761-440c-b254-b7937d064372'
}

const APPLICATION_APPLICANT_ORGANISATION_1 = {
  id: '6456c9fe-6e14-46a2-8b45-6eecc45d9a46',
  applicationId: APPLICATION.id,
  accountId: APPLICANT_ORGANISATION_1.id,
  accountRole: 'APPLICANT-ORGANISATION'
}

const ECOLOGIST_1 = {
  id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb',
  sddsContactId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064',
  userId: null
}

const APPLICATION_ECOLOGIST_1 = {
  id: '412d7297-643d-485b-8745-cc25a0e6ec0a',
  applicationId: APPLICATION.id,
  contactId: ECOLOGIST_1.id,
  contactRole: 'ECOLOGIST'
}

const ECOLOGIST_ORGANISATION_1 = {
  id: '313279d5-0fd7-4f39-a789-4d92f22cbc72',
  sddsAccountId: '0ec2ec3d-62d2-4211-b636-8e53019b7921'
}

const APPLICATION_ECOLOGIST_ORGANISATION_1 = {
  id: '6b09bf61-5f75-4e34-9edf-0f1560203c58',
  applicationId: APPLICATION.id,
  accountId: ECOLOGIST_ORGANISATION_1.id,
  accountRole: 'ECOLOGIST-ORGANISATION'
}

describe('The licence-resend job processor', () => {
  beforeEach(() => jest.resetModules())

  describe('The buildApiObject function - creates a data and keys payload for the batch update process', () => {
    it('will return null if no application found', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({}))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: jest.fn(() => null) }
        }
      }))

      const { buildApiObject } = await import('../licence-resend-job-process.js')
      const result = await buildApiObject('2e6891ce-9f4d-4747-bd59-bb39de6cdaa3')
      expect(result).toBeNull()
    })

    it('result includes the applicant contact and ecologist organisations', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({}))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: () => APPLICATION },
          applicationContacts: { findAll: () => [APPLICATION_APPLICANT_1, APPLICATION_ECOLOGIST_1] },
          contacts: { findAll: () => [APPLICANT_1, ECOLOGIST_1] },
          applicationAccounts: { findAll: () => [APPLICATION_ECOLOGIST_ORGANISATION_1] },
          accounts: { findAll: () => [ECOLOGIST_ORGANISATION_1] }
        }
      }))

      const { buildApiObject } = await import('../licence-resend-job-process.js')
      const result = await buildApiObject('2e6891ce-9f4d-4747-bd59-bb39de6cdaa3')
      expect(result.emailLicence).toEqual(expect.arrayContaining([
        {
          data: {
            sddsApplicationId: '510db545-4136-48c4-9680-98d89d3962e7'
          },
          keys: {
            apiKey: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
          }
        }
      ]))
    })

    it('result includes the applicant organisations and ecologist contact', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({}))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: () => APPLICATION },
          applicationContacts: { findAll: () => [APPLICATION_APPLICANT_1, APPLICATION_ECOLOGIST_1] },
          contacts: { findAll: () => [APPLICANT_1, ECOLOGIST_1] },
          applicationAccounts: { findAll: () => [APPLICATION_APPLICANT_ORGANISATION_1] },
          accounts: { findAll: () => [APPLICANT_ORGANISATION_1] }
        }
      }))

      const { buildApiObject } = await import('../licence-resend-job-process.js')
      const result = await buildApiObject('2e6891ce-9f4d-4747-bd59-bb39de6cdaa3')
      expect(result.emailLicence).toEqual(expect.arrayContaining([
        {
          data: {
            sddsApplicationId: '510db545-4136-48c4-9680-98d89d3962e7'
          },
          keys: {
            apiKey: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
          }
        }
      ]))
    })
  })

  describe('The licenceResendJobProcess function', () => {
    it('Resolves when there is no error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({
        licenceResend: jest.fn(),
        UnRecoverableBatchError: Error
      }))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: () => null }
        }
      }))
      const { licenceResendJobProcess } = await import('../licence-resend-job-process.js')
      await expect(() => licenceResendJobProcess({ data: 'f5f4c88f-23b0-463e-beed-3256fb1ef5df' })).resolves
    })

    it('Resolves with unrecoverable error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => {
        return {
          UnRecoverableBatchError: UnRecoverableBatchError,
          licenceResend: jest.fn(() => { throw new UnRecoverableBatchError() })
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: () => APPLICATION },
          applicationContacts: { findAll: () => [APPLICATION_APPLICANT_1, APPLICATION_ECOLOGIST_1] },
          contacts: { findAll: () => [APPLICANT_1, ECOLOGIST_1] },
          applicationAccounts: { findAll: () => [] },
          accounts: { findAll: () => [] }
        }
      }))
      const { licenceResendJobProcess } = await import('../licence-resend-job-process.js')
      await expect(() => licenceResendJobProcess({ data: 'f5f4c88f-23b0-463e-beed-3256fb1ef5df' })).resolves
    })

    it('Throws with recoverable error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => {
        return {
          UnRecoverableBatchError: UnRecoverableBatchError,
          licenceResend: jest.fn(() => { throw new Error() })
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: { findByPk: () => APPLICATION },
          applicationContacts: { findAll: () => [APPLICATION_APPLICANT_1, APPLICATION_ECOLOGIST_1] },
          contacts: { findAll: () => [APPLICANT_1, ECOLOGIST_1] },
          applicationAccounts: { findAll: () => [] },
          accounts: { findAll: () => [] }
        }
      }))
      const { licenceResendJobProcess } = await import('../licence-resend-job-process.js')
      await expect(() => licenceResendJobProcess({ data: 'f5f4c88f-23b0-463e-beed-3256fb1ef5df' })).rejects.toThrow()
    })
  })
})
