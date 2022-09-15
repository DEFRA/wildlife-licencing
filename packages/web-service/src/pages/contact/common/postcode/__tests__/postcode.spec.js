describe('the postcode functions', () => {
  beforeEach(() => jest.resetModules())

  describe('getPostcodeData', () => {
    it('gets the contact name, the account name and the postcode', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards' }))
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({ name: 'The Rolling Stones', address: { postcode: 'SW1W 0NY' } }))
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        })
      }
      const urlBase = {
        ADDRESS: { uri: '/applicant-address', page: 'applicant-address' },
        ADDRESS_FORM: { uri: '/applicant-address-form', page: 'applicant-address-form' }
      }
      const { getPostcodeData } = await import('../postcode.js')
      const result = await getPostcodeData('APPLICANT', 'APPLICANT_ORGANISATION', urlBase)(request)
      expect(result).toEqual({
        accountName: 'The Rolling Stones',
        contactName: 'Keith Richards',
        postcode: 'SW1W 0NY',
        uri: {
          addressForm: '/applicant-address-form?no-postcode=true'
        }
      })
    })
  })

  describe('setPostcodeData', () => {
    it('sets the postcode and looks up the address', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              remove: jest.fn()
            })
          }
        }
      }))
      const mockSetAddress = jest.fn()
      jest.doMock('../../common.js', () => ({
        contactAccountOperations: () => ({
          setAddress: mockSetAddress
        })
      }))
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })),
          getPageData: jest.fn(() => ({ payload: { postcode: 'SW1W 0NY' } })),
          setData: mockSetData
        })
      }
      const mockLookup = jest.fn(() => ({ results: [{ foo: 'bar' }] }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        ADDRESS: {
          lookup: mockLookup
        }
      }))
      const { setPostcodeData } = await import('../postcode.js')
      await setPostcodeData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetAddress).toHaveBeenCalledWith({ postcode: 'SW1W 0NY' })
      expect(mockSetData).toHaveBeenCalledWith(expect.objectContaining({ addressLookup: [{ foo: 'bar' }] }))
    })

    it('sets the postcode and looks up the address, deleting the address lookup cache data on a null result', async () => {
      const mockSetAddress = jest.fn()
      jest.doMock('../../common.js', () => ({
        contactAccountOperations: () => ({
          setAddress: mockSetAddress
        })
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              remove: jest.fn()
            })
          }
        }
      }))
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })),
          getPageData: jest.fn(() => ({ payload: { postcode: 'SW1W 0NY' } })),
          setData: mockSetData
        })
      }
      const mockLookup = jest.fn(() => ({ results: [] }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        ADDRESS: {
          lookup: mockLookup
        }
      }))
      const { setPostcodeData } = await import('../postcode.js')
      await setPostcodeData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetData).toHaveBeenCalledWith({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })
    })
  })

  describe('postcodeCompletion', () => {
    it('returns the address page if the lookup result contains addresses', async () => {
      const { postcodeCompletion } = await import('../postcode.js')
      const urlBase = { ADDRESS: { uri: '/applicant-address', page: 'applicant-address' } }
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ addressLookup: [{ foo: 'bar' }] }))
        })
      }
      const result = await postcodeCompletion(urlBase)(request)
      expect(result).toEqual('/applicant-address')
    })
    it('returns the address-form page if the lookup result contains addresses', async () => {
      const { postcodeCompletion } = await import('../postcode.js')
      const urlBase = {
        ADDRESS: { uri: '/applicant-address', page: 'applicant-address' },
        ADDRESS_FORM: { uri: '/applicant-address-form', page: 'applicant-address-form' }
      }
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ }))
        })
      }
      const result = await postcodeCompletion(urlBase)(request)
      expect(result).toEqual('/applicant-address-form')
    })
  })
})
