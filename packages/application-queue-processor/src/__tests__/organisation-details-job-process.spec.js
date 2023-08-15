jest.spyOn(console, 'error').mockImplementation(() => null)

const organisationId = 'b1847e67-07fa-4c51-af03-cb51f5126939'

const job = {
  data: {
    organisationId
  }
}

describe('The organisation details job processor', () => {
  beforeEach(() => jest.resetModules())
  it('requests the organisation details from the defra-customer  interface and writes into the organisation table', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-defra-customer-lib', () => ({
      getOrganisationData: () => ({ foo: 'bar' })
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        organisations: { update: mockUpdate }
      }
    }))
    const { organisationDetailsJobProcess } = await import('../organisation-details-job-process.js')
    await organisationDetailsJobProcess(job)
    expect(mockUpdate).toHaveBeenCalledWith({ organisation: { foo: 'bar' } }, { returning: false, where: { id: 'b1847e67-07fa-4c51-af03-cb51f5126939' } })
  })
  it('throws on any error', async () => {
    jest.doMock('@defra/wls-defra-customer-lib', () => ({
      getOrganisationData: () => { throw new Error() }
    }))
    const { organisationDetailsJobProcess } = await import('../organisation-details-job-process.js')
    await expect(async () => await organisationDetailsJobProcess(job)).rejects.toThrow()
  })
})
