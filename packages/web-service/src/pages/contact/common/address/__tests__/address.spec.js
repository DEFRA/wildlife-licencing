describe('the address functions', () => {
  beforeEach(() => jest.resetModules())

  describe('getAddressData', () => {
    it('gets the contact name, account name, postcode and the address-lookup result', async () => {
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
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            addressLookup: [{ Address: { Street: 'EBURY STREET' } }]
          }))
        })
      }
      const urlBase = {
        ADDRESS_FORM: { uri: '/applicant-address-form', page: 'applicant-address-form' }
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
          addressForm: '/applicant-address-form'
        }
      })
    })
  })

  describe('setAddressData', () => {
    it('sets the account address', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards' }))
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({ name: 'The Rolling Stones', address: { postcode: 'SW1W 0NY' } })),
            update: mockUpdate
          }
        }
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
      expect(mockUpdate).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7', {
        address: { postcode: 'SW1W 0NY', street: 'EBURY STREET', uprn: '123' },
        name: 'The Rolling Stones'
      })
    })

    it('sets the contact address', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards', address: { postcode: 'SW1W 0NY' } })),
            update: mockUpdate
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => null)
          }
        }
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
      expect(mockUpdate).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7', {
        address: { postcode: 'SW1W 0NY', street: 'EBURY STREET', uprn: '123' },
        fullName: 'Keith Richards'
      })
    })
  })
})
