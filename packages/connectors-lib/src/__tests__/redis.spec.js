describe('The redis connector', () => {
  it('connects', async () => {
    jest.mock('redis', () => ({
      createClient: jest.fn(() => ({ connect: jest.fn() }))
    }))
    const { createClient } = await import('redis')
    const { REDIS } = await import('../redis.js')
    await REDIS.initialiseConnection()
    expect(createClient).toHaveBeenCalled()
    expect(REDIS.getClient()).not.toBeNull()
  })
})
