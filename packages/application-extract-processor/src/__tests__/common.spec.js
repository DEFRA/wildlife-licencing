import { addressProcess } from '../common.js'

describe('common functions', () => {
  it('The address processor works for an entered address', async () => {
    const address = {
      town: 'Zermatt',
      county: 'Devon',
      locality: 'Locality',
      addressLine1: 'Building and street',
      addressLine2: 'Locality'
    }
    addressProcess(address)
    expect(address).toEqual({
      town: 'Zermatt',
      county: 'Devon',
      addressLine1: 'Building and street',
      addressLine2: 'Locality'
    })
  })
  it('The address processor works for a looked-up address', async () => {
    const address = {
      town: 'LONDON',
      uprn: '100022746824',
      county: 'CITY OF WESTMINSTER',
      country: 'ENGLAND',
      postcode: 'SW1W 0NY',
      street: 'EBURY STREET',
      addressLine1: 'EBURY STREET',
      buildingName: 'BELGRAVIA COURT',
      buildingNumber: '33',
      subBuildingName: 'FLAT 1'
    }

    addressProcess(address)
    expect(address).toEqual({
      buildingName: 'BELGRAVIA COURT',
      buildingNumber: '33',
      country: 'ENGLAND',
      county: 'CITY OF WESTMINSTER',
      postcode: 'SW1W 0NY',
      street: 'EBURY STREET',
      subBuildingName: 'FLAT 1',
      town: 'LONDON',
      uprn: '100022746824'
    })
  })

  it('The address processor does not throw with a null address', async () => {
    expect(() => addressProcess(null)).not.toThrow()
  })
})
