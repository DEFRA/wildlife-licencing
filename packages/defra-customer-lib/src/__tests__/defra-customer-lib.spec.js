describe('The defra-customer library', () => {
  beforeEach(() => jest.resetModules())

  it('transforms returned user data correctly', async () => {
    const mockFetch = jest.fn().mockReturnValue({
      emailaddress1: 'sdds.ne+isla.ward@gmail.com',
      fullname: 'Isla Ward',
      telephone1: '+44923247832',
      defra_uniquereference: 'BA202320-N2-2606-L2-1210',
      defra_addrcorbuildingname: '1 NOOK COTTAGES',
      defra_addrcorsubbuildingname: null,
      defra_addrcorbuildingnumber: null,
      defra_addrcorstreet: null,
      defra_addrcorlocality: 'LUPTON',
      defra_addrcortown: 'CARNFORTH',
      defra_addrcorcounty: 'WESTMORLAND AND FURNESS',
      defra_addrcorpostcode: 'LA6 1PQ',
      defra_addrcoruprn: '10003946446',
      contactid: '78d5df91-0b09-ee11-8f6e-6045bd905113'
    })

    jest.doMock('@defra/wls-connectors-lib/src/power-apps.js', () => ({
      DEFRA_CUSTOMER: {
        fetch: mockFetch
      }
    }))
    const { getUserData } = await import('../defra-customer-lib.js')
    const result = await getUserData('78d5df91-0b09-ee11-8f6e-6045bd905113')
    expect(mockFetch).toHaveBeenCalledWith('contacts(78d5df91-0b09-ee11-8f6e-6045bd905113)?$select=emailaddress1,fullname,telephone1,defra_uniquereference,defra_addrcorsubbuildingname,defra_addrcorbuildingname,defra_addrcorbuildingnumber,defra_addrcorstreet,defra_addrcorlocality,defra_addrcortown,defra_addrcorcounty,defra_addrcorpostcode,defra_addrcoruprn')
    expect(result).toEqual({
      address: {
        buildingName: '1 NOOK COTTAGES',
        county: 'WESTMORLAND AND FURNESS',
        dependentLocality: 'LUPTON',
        locality: 'LUPTON',
        postcode: 'LA6 1PQ',
        town: 'CARNFORTH',
        uprn: '10003946446'
      },
      contactDetails: {
        email: 'sdds.ne+isla.ward@gmail.com'
      },
      fullName: 'Isla Ward'
    })
  })
  it('transforms returned organisation data correctly', async () => {
    const mockFetch = jest.fn().mockReturnValue({
      name: '17 HENLEAZE ROAD MANAGEMENT COMPANY LIMITED',
      emailaddress1: 'sdds.ne+henleaze.management@gmail.com',
      defra_addrregsubbuildingname: null,
      defra_addrregbuildingname: null,
      defra_addrregbuildingnumber: '17',
      defra_addrregstreet: 'Henleaze Road',
      defra_addrreglocality: 'Henleaze',
      defra_addrregtown: 'Bristol',
      defra_addrregcounty: null,
      defra_addrregpostcode: 'BS9 4EY',
      defra_addrreguprn: null,
      telephone1: '01275844014',
      accountid: 'fe4b4959-0d09-ee11-8f6e-6045bd905113'
    })

    jest.doMock('@defra/wls-connectors-lib/src/power-apps.js', () => ({
      DEFRA_CUSTOMER: {
        fetch: mockFetch
      }
    }))
    const { getOrganisationData } = await import('../defra-customer-lib.js')
    const result = await getOrganisationData('78d5df91-0b09-ee11-8f6e-6045bd905113')
    expect(mockFetch).toHaveBeenCalledWith('accounts(78d5df91-0b09-ee11-8f6e-6045bd905113)?$select=name,emailaddress1,defra_addrregsubbuildingname,defra_addrregbuildingname,defra_addrregbuildingnumber,defra_addrregstreet,defra_addrreglocality,defra_addrregtown,defra_addrregcounty,defra_addrregpostcode,defra_addrreguprn')
    expect(result).toEqual({
      address: {
        buildingNumber: '17',
        locality: 'Henleaze',
        postcode: 'BS9 4EY',
        street: 'Henleaze Road',
        town: 'Bristol'
      },
      contactDetails: {
        email: 'sdds.ne+henleaze.management@gmail.com'
      },
      name: '17 HENLEAZE ROAD MANAGEMENT COMPANY LIMITED'
    })
  })
})
