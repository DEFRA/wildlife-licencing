import {
  SddsApplication,
  SddsSite,
  Contact,
  Account
} from '../../tables/tables.js'

const srcObj = {
  application: {
    proposalDescription: 'Badgers are proposed to be moved',
    detailsOfConvictions: 'no convictions',
    licenceReason: 'need to move some badgers',
    applicationType: 'MIT BAT A045',
    applicationPurpose: 'Keeping badgers in zoological gardens or collections',
    applicationCategory: 100000001,
    applicant: {
      firstname: 'Bob',
      lastname: 'Slaigh',
      address: {
        houseNumber: '2123',
        addrline1: 'the grove',
        addrline2: 'henleaze',
        county: 'bristol',
        town: 'briztol',
        postcode: 'bs1999'
      },
      contactDetails: {
        email: 'me@email.com',
        phone: '16542'
      }
    },
    ecologist: {
      firstname: 'Mr Brian',
      lastname: 'Yak',
      address: {
        houseNumber: '2123',
        addrline1: 'Old Hill',
        addrline2: 'Stapleton',
        addrline3: 'Nr. Bristol',
        county: 'Somerset',
        town: 'Bristol',
        postcode: 'bs11 1pw'
      },
      contactDetails: {
        email: 'brian.yak@email.com',
        phone: '234234'
      }
    },
    sites: [
      {
        name: 'The badger set 1',
        address: {
          houseNumber: 'The fields',
          addrline1: 'Winscombe',
          county: 'Somerset',
          postcode: 'bs21 2XX'
        },
        gridReference: '7868962'
      },
      {
        name: 'The badger set 2',
        address: {
          houseNumber: 'The fields',
          addrline1: 'Winscombe',
          county: 'Somerset',
          postcode: 'bs22 2XX'
        },
        gridReference: '7868962'
      },
      {
        name: 'The badger set 3',
        address: {
          houseNumber: 'The fields',
          addrline1: 'Winscombe',
          county: 'Somerset',
          postcode: 'bs23 2XX'
        },
        gridReference: '786896'
      }
    ]
  }
}

describe('the schema processes', () => {
  beforeEach(() => jest.resetModules())

  it('can determine the correct batch update sequence', async () => {
    const { createTableSet } = await import('../schema-processes.js')
    const tableSet = createTableSet(SddsApplication,
      [SddsSite, Contact, Account])

    expect(tableSet.map(t => t.name))
      .toEqual(['sdds_site', 'contact', 'account', 'contact', 'account', 'sdds_application'])
  })

  it('can create the batch update columns object for specific table', async () => {
    const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
    const tableSet = createTableSet(SddsApplication, [Contact, Account])
    const ecologist = tableSet.find(ts => ts.basePath === 'application.ecologist')
    const applicationPayload = await createTableColumnsPayload(ecologist, srcObj)
    expect(applicationPayload).toEqual({
      firstname: 'Mr Brian',
      lastname: 'Yak',
      telephone1: '234234',
      emailaddress1: 'brian.yak@email.com',
      address1_line1: 'Old Hill',
      address1_line2: 'Stapleton',
      address1_line3: 'Nr. Bristol',
      address1_county: 'Somerset',
      address1_city: 'Bristol',
      address1_postalcode: 'BS11 1PW'
    })
  })

  it('returns a null batch update columns object with a required fields missing', async () => {
    const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
    const tableSet = createTableSet(SddsApplication, [Contact, Account])
    const ecologist = tableSet.find(ts => ts.basePath === 'application.ecologist')
    const newSrc = Object.assign(srcObj)
    newSrc.application.ecologist.firstname = null
    const applicationPayload = await createTableColumnsPayload(ecologist, srcObj)
    expect(applicationPayload).toBeNull()
  })

  it('can create the batch update columns for a set of table items', async () => {
    const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
    const tableSet = createTableSet(SddsApplication, [Contact, Account, SddsSite])
    const site = tableSet.find(ts => ts.name === 'sdds_site')
    const sitesPayloads = await createTableColumnsPayload(site, srcObj)
    expect(sitesPayloads).toEqual([
      {
        name: 'The badger set 1',
        sdds_osgridreference: '7868962',
        sdds_addressline1: 'Winscombe',
        sdds_addressline2: null,
        sdds_addressline3: null,
        sdds_county: 'Somerset',
        sdds_town: null,
        sdds_postcode: 'BS21 2XX'
      },
      {
        name: 'The badger set 2',
        sdds_osgridreference: '7868962',
        sdds_addressline1: 'Winscombe',
        sdds_addressline2: null,
        sdds_addressline3: null,
        sdds_county: 'Somerset',
        sdds_town: null,
        sdds_postcode: 'BS22 2XX'
      },
      {
        name: 'The badger set 3',
        sdds_osgridreference: '786896',
        sdds_addressline1: 'Winscombe',
        sdds_addressline2: null,
        sdds_addressline3: null,
        sdds_county: 'Somerset',
        sdds_town: null,
        sdds_postcode: 'BS23 2XX'
      }
    ])
  })

  it('can create the batch update many-to-one relationships object for specific table', async () => {
    const mockGetReferenceDataIdByName = jest.fn(() => 123)
    jest.doMock('../../../../refdata/cache.js', () => ({
      getReferenceDataIdByName: mockGetReferenceDataIdByName
    }))

    const { SddsApplication, SddsSite, Contact, Account } = await import('../../tables/tables.js')
    const { createTableRelationshipsPayload, createTableSet } = await import('../schema-processes.js')
    const tableSet = createTableSet(SddsApplication, [Contact, Account, SddsSite])
    const application = tableSet.find(ts => ts.basePath === 'application')
    const applicationPayload = await createTableRelationshipsPayload(application, tableSet, srcObj)
    expect(applicationPayload).toEqual(
      {
        'sdds_applicantid@odata.bind': 'sdds_application_applicantid_Contact',
        'sdds_organisationid@odata.bind': 'sdds_application_organisationid_Account',
        'sdds_ecologistid@odata.bind': 'sdds_application_ecologistid_Contact',
        'sdds_ecologistorganisationid@odata.bind': 'sdds_application_ecologistorganisationid_',
        'sdds_applicationtypesid@odata.bind': '/sdds_applicationtypes(123)',
        'sdds_applicationpurpose@odata.bind': '/sdds_applicationpurpose(123)'
      }
    )
  })
})
