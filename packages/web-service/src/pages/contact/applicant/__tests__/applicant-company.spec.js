describe('applicant-company', () => {
  beforeEach(() => jest.resetModules())
  it('getApplicantOrganizationData returns the applicant and applicant organization from the database', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT: {
          getById: jest.fn(() => ({ fullName: 'Bloggs' }))
        },
        APPLICANT_ORGANIZATION: {
          getById: jest.fn(() => ({ name: '123 Ltd.' }))
        }
      }
    }))
    const { getApplicantOrganizationData } = await import('../../common/common.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        }))
      })
    }
    const result = await getApplicantOrganizationData(request)
    expect(result).toEqual({
      contact: {
        fullName: 'Bloggs'
      },
      organization: {
        name: '123 Ltd.'
      }
    })
  })

  it('setApplicantOrganizationData writes the applicant organization to the database', async () => {
    const mockPutById = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT_ORGANIZATION: {
          putById: mockPutById,
          getById: jest.fn(() => ({ name: '123 Ltd.' }))
        }
      }
    }))
    const { setApplicantOrganizationData } = await import('../../common/common.js')
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
    await setApplicantOrganizationData(request)
    expect(mockPutById).toHaveBeenCalledWith('dad9d73e-d591-41df-9475-92c032bd3ceb', { name: 'XYZ ltd.' })
  })

  it('setApplicantOrganizationData removes the applicant organization to the database', async () => {
    const mockDeleteById = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT_ORGANIZATION: {
          deleteById: mockDeleteById,
          getById: jest.fn(() => ({ name: '123 Ltd.' }))
        }
      }
    }))
    const { setApplicantOrganizationData } = await import('../../common/common.js')
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
    await setApplicantOrganizationData(request)
    expect(mockDeleteById).toHaveBeenCalledWith('dad9d73e-d591-41df-9475-92c032bd3ceb')
  })
})
