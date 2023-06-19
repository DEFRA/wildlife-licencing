jest.spyOn(console, 'error').mockImplementation(() => null)

describe('aws connectors', () => {
  beforeEach(() => jest.resetModules())
  describe('The S3 functions', () => {
    it('ReadFileStream calls the underlying API correctly', async () => {
      const mockSend = jest.fn().mockReturnValue({ Body: 'HGFDS', ContentLength: 5 })
      const mockGet = jest.fn()
      const mockDestroy = jest.fn()
      jest.doMock('@aws-sdk/client-s3', () => ({
        S3Client: jest.fn().mockImplementation(() => ({
          send: mockSend,
          destroy: mockDestroy
        })),
        GetObjectCommand: jest.fn().mockImplementation(mockGet)
      }))

      jest.doMock('../config.js', () => ({
        aws: {
          s3: {
            endpoint: 'http://localhost:8080',
            bucket: 'bucket'
          }
        }
      }))

      const { AWS } = await import('../aws.js')
      const { ReadFileStream } = AWS.S3
      const result = await ReadFileStream('object-key')
      expect(result).toEqual({ bytes: 5, stream: 'HGFDS' })
      expect(mockGet).toHaveBeenCalledWith({ Bucket: 'bucket', Key: 'object-key' })
      expect(mockSend).toHaveBeenCalled()
      expect(mockDestroy).toHaveBeenCalled()
    })

    it('ReadFileStream handles an error correctly', async () => {
      const mockSend = jest.fn(() => { throw new Error() })
      const mockGet = jest.fn()
      const mockDestroy = jest.fn()
      jest.doMock('@aws-sdk/client-s3', () => ({
        S3Client: jest.fn().mockImplementation(() => ({
          send: mockSend,
          destroy: mockDestroy
        })),
        GetObjectCommand: jest.fn().mockImplementation(mockGet)
      }))

      jest.doMock('../config.js', () => ({
        aws: {
          s3: {
            endpoint: 'http://localhost:8080',
            bucket: 'bucket'
          }
        }
      }))

      const { AWS } = await import('../aws.js')
      const { ReadFileStream } = AWS.S3
      await expect(() => ReadFileStream('object-key')).rejects.toThrow()
      expect(mockDestroy).toHaveBeenCalled()
    })

    it('WriteFileStream calls the underlying API correctly', async () => {
      const mockSend = jest.fn().mockReturnValue()
      const mockPut = jest.fn()
      const mockDestroy = jest.fn()
      jest.doMock('@aws-sdk/client-s3', () => ({
        S3Client: jest.fn().mockImplementation(() => ({
          send: mockSend,
          destroy: mockDestroy
        })),
        PutObjectCommand: jest.fn().mockImplementation(mockPut)
      }))
      jest.doMock('../config.js', () => ({
        aws: {
          s3: {
            endpoint: 'http://localhost:8080',
            bucket: 'bucket'
          }
        }
      }))
      const { AWS } = await import('../aws.js')
      const { WriteFileStream } = AWS.S3
      await WriteFileStream('object-key', 'fs')
      expect(mockPut).toHaveBeenCalledWith({ Bucket: 'bucket', Key: 'object-key', ACL: 'authenticated-read', Body: 'fs' })
      expect(mockSend).toHaveBeenCalled()
      expect(mockDestroy).toHaveBeenCalled()
    })

    it('WriteFileStream handles error correctly correctly', async () => {
      const mockSend = jest.fn(() => { throw new Error() })
      const mockPut = jest.fn()
      const mockDestroy = jest.fn()
      jest.doMock('@aws-sdk/client-s3', () => ({
        S3Client: jest.fn().mockImplementation(() => ({
          send: mockSend,
          destroy: mockDestroy
        })),
        PutObjectCommand: jest.fn().mockImplementation(mockPut)
      }))
      jest.doMock('../config.js', () => ({
        aws: {
          s3: {
            endpoint: 'http://localhost:8080',
            bucket: 'bucket'
          }
        }
      }))
      const { AWS } = await import('../aws.js')
      const { WriteFileStream } = AWS.S3
      await expect(() => WriteFileStream('object-key', 'fs')).rejects.toThrow()
      expect(mockDestroy).toHaveBeenCalled()
    })
  })

  describe('The secret manager functions', () => {
    it('getSecret calls the underlying API correctly', async () => {
      const mockSend = jest.fn().mockReturnValue({ SecretString: '1234e' })
      const mockSecretsManagerClient = jest.fn(() => ({
        send: mockSend
      }))
      const mockGetSecretValueCommand = jest.fn()
      jest.doMock('@aws-sdk/client-secrets-manager', () => ({
        SecretsManagerClient: mockSecretsManagerClient,
        GetSecretValueCommand: mockGetSecretValueCommand
      }))
      jest.doMock('../config.js', () => ({
        aws: {
          secretsManager: {
            endpoint: 'https://aws.com'
          }
        }
      }))
      const { AWS } = await import('../aws.js')
      const sm = AWS.SecretsManager()
      const result = await sm.getSecret('name')
      expect(result).toEqual('1234e')
    })

    it('getSecret throws an error if the secret cannot be retrieved', async () => {
      const mockSend = jest.fn().mockImplementation(() => { throw Error() })
      const mockSecretsManagerClient = jest.fn(() => ({
        send: mockSend
      }))
      const mockGetSecretValueCommand = jest.fn()
      jest.doMock('@aws-sdk/client-secrets-manager', () => ({
        SecretsManagerClient: mockSecretsManagerClient,
        GetSecretValueCommand: mockGetSecretValueCommand
      }))
      jest.doMock('../config.js', () => ({
        aws: {
          secretsManager: {
            endpoint: 'https://aws.com'
          }
        }
      }))
      const { AWS } = await import('../aws.js')
      const sm = AWS.SecretsManager()
      await expect(() => sm.getSecret('name')).rejects.toThrow()
    })
  })
})
