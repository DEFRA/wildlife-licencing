describe('the address-form functions', () => {
  beforeEach(() => jest.resetModules())

  describe('getAddressFormData', () => {
    it('gets the contact name and account name', async () => {
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
      expect(mockSetAddress).toHaveBeenCalledWith({
        addressLine1: 'Building 1, 12 Kings Drive',
        addressLine2: 'Henleaze',
        town: 'Bristol'
      })
    })
  })
})
