describe('the address-form functions', () => {
  beforeEach(() => jest.resetModules())

  describe('getAddressFormData', () => {
    it('gets the contact name and account name', async () => {
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
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        }),
        query: {
          'no-postcode': true
        }
      }
      const { getAddressFormData } = await import('../address-form.js')
      const result = await getAddressFormData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(result).toEqual({
        accountName: 'The Rolling Stones',
        contactName: 'Keith Richards',
        postCode: false
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
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'address-line-1': 'Building 1, 12 Kings Drive',
              'address-line-2': 'Henleaze',
              'address-town': 'Bristol',
              'address-county': ''
            }
          }))
        })
      }

      const { setAddressFormData } = await import('../address-form.js')
      await setAddressFormData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockUpdate).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7', {
        address: {
          addressLine1: 'Building 1, 12 Kings Drive',
          addressLine2: 'Henleaze',
          town: 'Bristol'
        },
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
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'address-line-1': 'Building 1, 12 Kings Drive',
              'address-line-2': 'Henleaze',
              'address-town': 'Bristol',
              'address-county': ''
            }
          }))
        })
      }

      const { setAddressFormData } = await import('../address-form.js')
      await setAddressFormData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockUpdate).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7', {
        address: {
          addressLine1: 'Building 1, 12 Kings Drive',
          addressLine2: 'Henleaze',
          town: 'Bristol'
        },
        fullName: 'Keith Richards'
      })
    })
  })
})
