describe('ecologist-company', () => {
  beforeEach(() => jest.resetModules())
  it('getEcologistOrganizationData returns the ecologist and ecologist organization from the database', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        ECOLOGIST: {
          getById: jest.fn(() => ({ fullName: 'Bloggs' }))
        },
        ECOLOGIST_ORGANIZATION: {
          getById: jest.fn(() => ({ name: '123 Ltd.' }))
        }
      }
    }))
    const { getEcologistOrganizationData } = await import('../../common/common.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        }))
      })
    }
    const result = await getEcologistOrganizationData(request)
    expect(result).toEqual({
      contact: {
        fullName: 'Bloggs'
      },
      organization: {
        name: '123 Ltd.'
      }
    })
  })

  it('setEcologistOrganizationData writes the ecologist organization to the database', async () => {
    const mockPutById = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        ECOLOGIST_ORGANIZATION: {
          putById: mockPutById,
          getById: jest.fn(() => ({ name: '123 Ltd.' }))
        }
      }
    }))
    const { setEcologistOrganizationData } = await import('../../common/common.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        })),
        getPageData: jest.fn(() => ({
          payload: {
            'is-organization': 'yes',
            'organization-name': 'XYZ ltd.'
          }
        }))
      })
    }
    await setEcologistOrganizationData(request)
    expect(mockPutById).toHaveBeenCalledWith('dad9d73e-d591-41df-9475-92c032bd3ceb', { name: 'XYZ ltd.' })
  })

  it('setEcologistOrganizationData removes the ecologist organization to the database', async () => {
    const mockDeleteById = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        ECOLOGIST_ORGANIZATION: {
          deleteById: mockDeleteById,
          getById: jest.fn(() => ({ name: '123 Ltd.' }))
        }
      }
    }))
    const { setEcologistOrganizationData } = await import('../../common/common.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        })),
        getPageData: jest.fn(() => ({
          payload: {
            'is-organization': 'no'
          }
        }))
      })
    }
    await setEcologistOrganizationData(request)
    expect(mockDeleteById).toHaveBeenCalledWith('dad9d73e-d591-41df-9475-92c032bd3ceb')
  })
})
