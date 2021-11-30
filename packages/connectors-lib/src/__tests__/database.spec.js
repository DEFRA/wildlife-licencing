
jest.mock('@aws-sdk/client-secrets-manager', () => {
  return {
    GetSecretValueCommand: jest.fn().mockImplementation(() => { return {} }),
    SecretsManagerClient: jest.fn().mockImplementation(() => { return { send: () => ({ SecretString: 'bar' }) } })
  }
})

const mockQuery = jest.fn()
const mockRelease = jest.fn()
const mockEvent = jest.fn()
let mockConnect = jest.fn(async () => {
  return { query: mockQuery, release: mockRelease }
})

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => {
      return {
        connect: mockConnect,
        on: mockEvent
      }
    })
  }
})

describe('The database connector', () => {
  jest.isolateModules(() => {
    const { DATABASE } = require('../database.js')
    it('can connect', async () => {
      await DATABASE.initialiseConnection()
      expect(mockConnect).toHaveBeenCalled()
      expect(mockEvent).toHaveBeenCalled()
      expect(mockQuery).toHaveBeenCalled()
      expect(mockRelease).toHaveBeenCalled()
      expect(DATABASE.getPool()).not.toBeNull()

      // Test repeat call simply returns initialized connection
      mockConnect.mockClear()
      mockEvent.mockClear()
      mockQuery.mockClear()
      mockRelease.mockClear()
      await DATABASE.initialiseConnection()
      expect(mockConnect).toHaveBeenCalledTimes(0)
      expect(mockEvent).toHaveBeenCalledTimes(0)
      expect(mockQuery).toHaveBeenCalledTimes(0)
      expect(mockRelease).toHaveBeenCalledTimes(0)
    })
  })

  jest.isolateModules(() => {
    const { DATABASE } = require('../database.js')
    it('will throw on a connection error', async () => {
      mockConnect = jest.fn(() => { throw new Error() })
      const processStopSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation(jest.fn())
      await DATABASE.initialiseConnection()
      expect(processStopSpy).toHaveBeenCalled()
    })
  })
})
