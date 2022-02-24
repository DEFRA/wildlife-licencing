
describe('The queue connector', () => {
  beforeEach(() => jest.resetModules())
  it('fetches override paramaters', async () => {
    jest.doMock('../config.js', () => ({
      queue: {
        host: 'queue-host',
        port: 'queue-port',
        database: 'queue-database'
      }
    }))
    const { QUEUE } = await import('../queue.js')
    const c = QUEUE.connection
    expect(c).toEqual({
      database: 'queue-database',
      host: 'queue-host',
      port: 'queue-port'
    })
  })

  it('fallsback to redis paramaters', async () => {
    jest.doMock('../config.js', () => ({
      queue: {},
      redis: {
        host: 'redis-host',
        port: 'redis-port',
        database: 'redis-database'
      }
    }))
    const { QUEUE } = await import('../queue.js')
    const c = QUEUE.connection
    expect(c).toEqual({
      database: 'redis-database',
      host: 'redis-host',
      port: 'redis-port'
    })
  })
})
