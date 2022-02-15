import { buildObjectTransformer, createTableSet } from '../schema-processes.js'
import {
  SddsApplication,
  SddsSite,
  Contact,
  Account,
  SddsApplicationType,
  SddsApplicationPurpose
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
const powerAppsApplicationObj = {
  '@odata.context': 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0/$metadata#sdds_applications(sdds_applicationnumber,sdds_descriptionofproposal,sdds_detailsofconvictions,sdds_whydoyouneedalicence,sdds_applicationcategory,sdds_applicantid(firstname,lastname,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_organisationid(name,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_ecologistid(firstname,lastname,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_ecologistorganisationid(name,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_applicationtypesid(sdds_applicationname,sdds_description),sdds_applicationpurpose(sdds_name,sdds_description))/$entity',
  '@odata.etag': 'W/"3285321"',
  sdds_applicationnumber: 'B6F826',
  sdds_descriptionofproposal: 'Removal of badgers by dogs',
  sdds_detailsofconvictions: null,
  sdds_whydoyouneedalicence: 'New hosuing development',
  sdds_applicationcategory: 100000001,
  sdds_applicationid: '8d797550-818a-ec11-93b0-0022481b4422',
  sdds_applicantid: {
    '@odata.etag': 'W/"3285313"',
    firstname: 'Robert',
    lastname: 'Plant',
    telephone1: '16542',
    emailaddress1: 'me@email.com',
    address1_line1: 'the grove',
    address1_line2: 'henleaze',
    address1_line3: null,
    address1_county: 'bristol',
    address1_city: 'briz',
    address1_postalcode: 'BS1',
    contactid: '88797550-818a-ec11-93b0-0022481b4422'
  },
  sdds_organisationid: null,
  sdds_ecologistid: {
    '@odata.etag': 'W/"3285316"',
    firstname: 'Mr Brian',
    lastname: 'Ecologist',
    telephone1: 'string',
    emailaddress1: 'ecologist1@email.com',
    address1_line1: 'Old Hill',
    address1_line2: 'Stapleton',
    address1_line3: 'Nr. Bristol',
    address1_county: 'Somerset',
    address1_city: 'Bristol',
    address1_postalcode: 'BS11',
    contactid: '8a797550-818a-ec11-93b0-0022481b4422'
  },
  sdds_ecologistorganisationid: {
    '@odata.etag': 'W/"3285319"',
    name: 'Ecologist1_Org',
    telephone1: null,
    emailaddress1: null,
    address1_line1: 'a1',
    address1_line2: 'a2',
    address1_line3: 'a3',
    address1_county: 'c1',
    address1_city: 't1',
    address1_postalcode: '876',
    accountid: '8c797550-818a-ec11-93b0-0022481b4422'
  },
  sdds_applicationtypesid: {
    '@odata.etag': 'W/"3283675"',
    sdds_applicationname: 'A24 Badger',
    sdds_description: 'Any application that has got to do with a badger sett.',
    sdds_applicationtypesid: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
  },
  sdds_applicationpurpose: {
    '@odata.etag': 'W/"2843256"',
    sdds_name: 'Keeping badgers in zoological gardens or collections',
    sdds_description: 'Under section 10(1)(b) of the Act licences can be issued for the purpose of any zoological collection to take badgers or to sell badgers',
    sdds_applicationpurposeid: '81bbe720-9975-ec11-8943-0022481aacb0'
  }
}

describe('the schema processes', () => {
  beforeEach(() => jest.resetModules())

  it('can determine the correct batch update sequence', async () => {
    const { createTableSet } = await import('../schema-processes.js')
    const tableSet = createTableSet(SddsApplication,
      [SddsSite, Contact, Account])

    expect(tableSet.map(t => t.name))
      .toEqual(['sdds_sites', 'contacts', 'accounts', 'contacts', 'accounts', 'sdds_applications'])
  })

  it('can create the batch update columns object for specific table', async () => {
    const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
    const tableSet = createTableSet(SddsApplication, [Contact, Account])
    const ecologist = tableSet.find(ts => ts.basePath === 'application.ecologist')
    const applicationPayload = await createTableColumnsPayload(ecologist, srcObj)
    expect(applicationPayload).toEqual({
      relationshipsPayload: null,
      columnPayload: {
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
      }
    })
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

  it('inbound object transformer can process a single object', async () => {
    const tableSet = createTableSet(SddsApplication, [Contact, Account, SddsApplicationType, SddsApplicationPurpose])
    const objectTransformer = buildObjectTransformer(SddsApplication, tableSet)
    const result = await objectTransformer(powerAppsApplicationObj)
    expect(result).toEqual({})
  })
})
