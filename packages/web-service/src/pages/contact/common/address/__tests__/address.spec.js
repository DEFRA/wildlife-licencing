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
        ADDRESS_FORM: { uri: '/applicant-address-form', page: 'applicant-address-form' },
        POSTCODE: { uri: '/applicant-postcode', page: 'applicant-postcode' }
      }
      const { getAddressData } = await import('../address.js')
      const result = await getAddressData('APPLICANT', 'APPLICANT_ORGANISATION', urlBase)(request)
      expect(result).toEqual({
        accountName: 'The Rolling Stones',
        addressLookup: [
          {
            Address: {
              Street: 'EBURY STREET'
            }
          }
        ],
        contactName: 'Keith Richards',
        postcode: 'SW1W 0NY',
        uri: {
          addressForm: '/applicant-address-form',
          postcode: '/applicant-postcode'
        }
      })
    })
  })

  describe('setAddressData', () => {
    it('sets the address', async () => {
      const mockSetAddress = jest.fn()
      jest.doMock('../../common.js', () => ({
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

  describe('mapLookedUpAddress', () => {
    it('sets each element', async () => {
      const { mapLookedUpAddress } = await import('../address.js')
      expect(mapLookedUpAddress({})).toEqual({})
      expect(mapLookedUpAddress({ Postcode: '' })).toEqual({ })
      expect(mapLookedUpAddress({ Postcode: 'BS9' })).toEqual({ postcode: 'BS9' })
      expect(mapLookedUpAddress({ Postcode: 'BS9', Country: 'England' }))
        .toEqual({ postcode: 'BS9', country: 'England' })
    })
  })
})
