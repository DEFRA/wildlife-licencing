describe('The redis connector', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('connects', async () => {
    const mockRedis = {
      createClient: jest.fn(() => ({
        connect: jest.fn(),
        on: jest.fn(),
        set: jest.fn(),
        get: jest.fn()
      }))
    }

    jest.mock('redis', () => mockRedis)
    jest.mock('../config.js', () => ({
      redis: {
        host: 'hostname',
        port: 999
      }
    }))

    // const { createClient } = await import('redis')
    const { REDIS } = await import('../redis.js')
    await REDIS.initialiseConnection()
    expect(mockRedis.createClient).toHaveBeenCalledWith({
      socket: {
        host: 'hostname',
        port: 999
      }
    })
    expect(REDIS.getClient()).not.toBeNull()
  })

  it('connects - with db', async () => {
    const mockRedis = {
      createClient: jest.fn(() => ({
        connect: jest.fn(),
        on: jest.fn(),
        set: jest.fn(),
        get: jest.fn()
      }))
    }

    jest.mock('redis', () => mockRedis)
    jest.mock('../config.js', () => ({
      redis: {
        host: 'hostname',
        port: 999,
        database: 'db',
        password: 'pw'
      }
    }))

    // const { createClient } = await import('redis')
    const { REDIS } = await import('../redis.js')
    await REDIS.initialiseConnection()
    expect(mockRedis.createClient).toHaveBeenCalledWith({
      database: 'db',
      password: 'pw',
      socket: {
        host: 'hostname',
        port: 999,
        tls: true
      }
    })
    expect(REDIS.getClient()).not.toBeNull()
  })
})
