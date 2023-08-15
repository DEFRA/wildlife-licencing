jest.spyOn(console, 'error').mockImplementation(() => null)

const userId = 'b1847e67-07fa-4c51-af03-cb51f5126939'

const job = {
  data: {
    userId
  }
}

describe('The user details job processor', () => {
  beforeEach(() => jest.resetModules())
  it('requests the user details from the defra-customer  interface and writes into the user table', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-defra-customer-lib', () => ({
      getUserData: () => ({ foo: 'bar' })
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: { update: mockUpdate }
      }
    }))
    const { userDetailsJobProcess } = await import('../user-details-job-process.js')
    await userDetailsJobProcess(job)
    expect(mockUpdate).toHaveBeenCalledWith({ user: { foo: 'bar' } }, { returning: false, where: { id: 'b1847e67-07fa-4c51-af03-cb51f5126939' } })
  })
  it('throws on any error', async () => {
    jest.doMock('@defra/wls-defra-customer-lib', () => ({
      getUserData: () => { throw new Error() }
    }))
    const { userDetailsJobProcess } = await import('../user-details-job-process.js')
    await expect(async () => await userDetailsJobProcess(job)).rejects.toThrow()
  })
})
