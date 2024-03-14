describe('the address functions', () => {
  beforeEach(() => jest.resetModules())

  describe('getAddressData', () => {
    it('gets the contact name, account name, postcode and the address-lookup result', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards' }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ name: 'The Rolling Stones', address: { postcode: 'SW1W 0NY' } }))
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            addressLookup: [{ Address: { Street: 'EBURY STREET' } }]
          }))
        })
      }
      const urlBase = {
        ADDRESS_FORM: { uri: '/licence-holder-address-form', page: 'applicant-address-form' },
        POSTCODE: { uri: '/licence-holder-postcode', page: 'applicant-postcode' }
      }
      const { getAddressData } = await import('../address.js')
      const result = await getAddressData('APPLICANT', 'APPLICANT_ORGANISATION', urlBase)(request)
      expect(result).toEqual({
        accountName: 'The Rolling Stones',
        addressLookup: [
          {
            street: 'EBURY STREET'
          }
        ],
        contactName: 'Keith Richards',
        postcode: 'SW1W 0NY',
        uri: {
          addressForm: '/licence-holder-address-form',
          postcode: '/licence-holder-postcode'
        }
      })
    })
  })

  describe('setAddressData v1', () => {
    it('sets the address v1', async () => {
      const mockSetAddress = jest.fn()
      jest.doMock('../../operations.js', () => ({
        contactAccountOperations: () => ({
          setAddress: mockSetAddress
        })
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            addressLookup: [{ Address: { UPRN: '123', Street: 'EBURY STREET', Postcode: 'SW1W 0NY' } }]
          })),
          getPageData: jest.fn(() => ({ payload: { uprn: 123 } }))
        })
      }

      const { setAddressData } = await import('../address.js')
      await setAddressData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetAddress).toHaveBeenCalledWith({ postcode: 'SW1W 0NY', street: 'EBURY STREET', uprn: '123' })
    })
  })

  describe('setAddressData v2', () => {
    it('sets the address v2', async () => {
      const mockSetAddress = jest.fn()
      jest.doMock('../../operations.js', () => ({
        contactAccountOperations: () => ({
          setAddress: mockSetAddress
        })
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            addressLookup: [{ uprn: '123', street: 'EBURY STREET', postcode: 'SW1W 0NY' }]
          })),
          getPageData: jest.fn(() => ({ payload: { uprn: 123 } }))
        })
      }

      const { setAddressData } = await import('../address.js')
      await setAddressData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetAddress).toHaveBeenCalledWith({ postcode: 'SW1W 0NY', street: 'EBURY STREET', uprn: '123' })
    })
  })

  describe('mapLookedUpAddress', () => {
    it('set elements version 1', async () => {
      const { mapLookedUpAddress } = await import('../address.js')

      expect(mapLookedUpAddress([])).toEqual([])
      expect(mapLookedUpAddress([{ Address: { Postcode: '' } }])).toEqual([{}])
      expect(mapLookedUpAddress([{ Address: { Postcode: 'BS9' } }])).toEqual([{ postcode: 'BS9' }])
      expect(mapLookedUpAddress([{ Address: { Postcode: 'BS9', Country: 'England' } }])).toEqual([{ postcode: 'BS9', country: 'England' }])
    })

    it('set elements version 2', async () => {
      const { mapLookedUpAddress } = await import('../address.js')

      expect(mapLookedUpAddress([])).toEqual([])
      expect(mapLookedUpAddress([{ postcode: '' }])).toEqual([{}])
      expect(mapLookedUpAddress([{ postcode: 'BS9' }])).toEqual([{ postcode: 'BS9' }])
      expect(mapLookedUpAddress([{ postcode: 'BS9', country: 'England' }])).toEqual([{ postcode: 'BS9', country: 'England' }])
    })
  })
})
