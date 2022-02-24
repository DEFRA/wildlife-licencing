export const srcObj = {
  application: {
    id: 'c4d14353-028d-45d1-adcd-576a2386b3d1',
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
        id: '842fc15b-2858-4349-86ea-b33a0629a30b',
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
        id: '15385397-6df3-45f8-9c98-4551815bbfa0',
        name: 'The badger set 2',
        address: {
          houseNumber: 'The fields',
          addrline1: 'Winscombe',
          addrline2: null, // Explicit set of null
          county: 'Somerset',
          postcode: 'bs22 2XX'
        },
        gridReference: '7868962'
      },
      {
        id: '27e20450-f414-445e-995b-8d7caf53ab2c',
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

export const initialKeys = [{
  apiTable: 'applications',
  apiKey: 'c4d14353-028d-45d1-adcd-576a2386b3d1',
  apiBasePath: 'application',
  powerAppsTable: 'sdds_applications',
  powerAppsKey: null
},
{
  apiTable: 'applications',
  apiKey: 'c4d14353-028d-45d1-adcd-576a2386b3d1',
  apiBasePath: 'application.applicant',
  powerAppsTable: 'contacts',
  powerAppsKey: null
},
{
  apiTable: 'applications',
  apiKey: 'c4d14353-028d-45d1-adcd-576a2386b3d1',
  apiBasePath: 'application.application.ecologist',
  powerAppsTable: 'contacts',
  powerAppsKey: null
},
{
  apiTable: 'sites',
  apiKey: '842fc15b-2858-4349-86ea-b33a0629a30b',
  powerAppsTable: 'sdds_sites',
  apiBasePath: 'application.sites'
},
{
  apiTable: 'sites',
  apiKey: '15385397-6df3-45f8-9c98-4551815bbfa0',
  powerAppsTable: 'sdds_sites',
  apiBasePath: 'application.sites'
},
{
  apiTable: 'sites',
  apiKey: '27e20450-f414-445e-995b-8d7caf53ab2c',
  powerAppsTable: 'sdds_sites',
  apiBasePath: 'application.sites'
}]

export const updateKeys = [{
  apiTable: 'applications',
  apiKey: 'c4d14353-028d-45d1-adcd-576a2386b3d1',
  apiBasePath: 'application',
  powerAppsTable: 'sdds_applications',
  powerAppsKey: 'd32e4cca-1cf7-4d77-a3a2-1e43ac90767b'
},
{
  apiTable: 'applications',
  apiKey: null,
  apiBasePath: 'application.applicant',
  powerAppsTable: 'contacts',
  powerAppsKey: '2b0ff9c1-4724-4954-95cf-bd52a5980dd9'
},
{
  apiTable: 'applications',
  apiKey: null,
  apiBasePath: 'application.ecologist',
  powerAppsTable: 'contacts',
  powerAppsKey: '2b0ff9c1-4724-4954-95cf-bd52a5980dd9'
},
{
  apiTable: 'sites',
  apiKey: '842fc15b-2858-4349-86ea-b33a0629a30b',
  powerAppsTable: 'sdds_sites',
  apiBasePath: 'application.sites',
  powerAppsKey: 'c5fb592f-15e5-4879-ab33-ac4033619fc6'
},
{
  apiTable: 'sites',
  apiKey: '15385397-6df3-45f8-9c98-4551815bbfa0',
  powerAppsTable: 'sdds_sites',
  apiBasePath: 'application.sites',
  powerAppsKey: '7a1e056e-4cb9-4fb4-beae-ae5ff600e989'
},
{
  apiTable: 'sites',
  apiKey: '27e20450-f414-445e-995b-8d7caf53ab2c',
  powerAppsTable: 'sdds_sites',
  apiBasePath: 'application.sites',
  powerAppsKey: 'cea890f9-a104-44c0-9415-2b60fefd84c6'
}]

export const initialGeneratedAssignmentsObject = [
  expect.objectContaining({
    assignments: expect.objectContaining({
      sdds_name: 'The badger set 1'
    }),
    contentId: 1,
    method: 'POST',
    table: 'sdds_sites'
  }),
  expect.objectContaining({
    assignments: expect.objectContaining({
      sdds_name: 'The badger set 2'
    }),
    contentId: 2,
    method: 'POST',
    table: 'sdds_sites'
  }),
  expect.objectContaining({
    assignments: expect.objectContaining({
      sdds_name: 'The badger set 3'
    }),
    contentId: 3,
    method: 'POST',
    table: 'sdds_sites'
  }),
  expect.objectContaining({
    assignments: expect.objectContaining({
      emailaddress1: 'me@email.com'
    }),
    contentId: 4,
    method: 'POST',
    table: 'contacts'
  }),
  expect.objectContaining({
    assignments: expect.objectContaining({
      emailaddress1: 'brian.yak@email.com'
    }),
    contentId: 5,
    method: 'POST',
    table: 'contacts'
  }),
  expect.objectContaining({
    assignments: {
      'sdds_applicantid@odata.bind': '$4',
      sdds_applicationcategory: 100000001,
      sdds_applicationnumber: expect.any(String),
      'sdds_applicationpurpose@odata.bind': '/sdds_applicationpurposes(001)',
      'sdds_applicationtypesid@odata.bind': '/sdds_applicationtypeses(001)',
      sdds_descriptionofproposal: 'Badgers are proposed to be moved',
      sdds_detailsofconvictions: 'no convictions',
      'sdds_ecologistid@odata.bind': '$5',
      sdds_whydoyouneedalicence: 'need to move some badgers'
    },
    contentId: 6,
    method: 'POST',
    table: 'sdds_applications'
  }),
  expect.objectContaining({
    assignments: {
      '@odata.id': '$1'
    },
    contentId: 7,
    method: 'POST',
    table: '$6/sdds_application_sdds_site_sdds_site/$ref'
  }),
  expect.objectContaining({
    assignments: {
      '@odata.id': '$2'
    },
    contentId: 8,
    method: 'POST',
    table: '$6/sdds_application_sdds_site_sdds_site/$ref'
  }),
  expect.objectContaining({
    assignments: {
      '@odata.id': '$3'
    },
    contentId: 9,
    method: 'POST',
    table: '$6/sdds_application_sdds_site_sdds_site/$ref'
  })
]

export const updatedGeneratedAssignmentsObject = [
  expect.objectContaining({
    assignments: expect.objectContaining({
      sdds_name: 'The badger set 1'
    }),
    contentId: 1,
    method: 'PATCH',
    table: 'sdds_sites'
  }),
  expect.objectContaining({
    assignments: expect.objectContaining({
      sdds_name: 'The badger set 2'
    }),
    contentId: 2,
    method: 'PATCH',
    table: 'sdds_sites'
  }),
  expect.objectContaining({
    assignments: expect.objectContaining({
      sdds_name: 'The badger set 3'
    }),
    contentId: 3,
    method: 'PATCH',
    table: 'sdds_sites'
  }),
  expect.objectContaining({
    assignments: expect.objectContaining({
      emailaddress1: 'me@email.com'
    }),
    contentId: 4,
    method: 'PATCH',
    table: 'contacts'
  }),
  expect.objectContaining({
    assignments: expect.objectContaining({
      emailaddress1: 'brian.yak@email.com'
    }),
    contentId: 5,
    method: 'PATCH',
    table: 'contacts'
  }),
  expect.objectContaining({
    assignments: {
      'sdds_applicantid@odata.bind': '$4',
      sdds_applicationcategory: 100000001,
      sdds_applicationnumber: expect.any(String),
      'sdds_applicationpurpose@odata.bind': '/sdds_applicationpurposes(001)',
      'sdds_applicationtypesid@odata.bind': '/sdds_applicationtypeses(001)',
      sdds_descriptionofproposal: 'Badgers are proposed to be moved',
      sdds_detailsofconvictions: 'no convictions',
      'sdds_ecologistid@odata.bind': '$5',
      sdds_whydoyouneedalicence: 'need to move some badgers'
    },
    contentId: 6,
    method: 'PATCH',
    table: 'sdds_applications'
  }),
  expect.objectContaining({
    assignments: {
      '@odata.id': '$1'
    },
    contentId: 7,
    method: 'POST',
    table: '$6/sdds_application_sdds_site_sdds_site/$ref'
  }),
  expect.objectContaining({
    assignments: {
      '@odata.id': '$2'
    },
    contentId: 8,
    method: 'POST',
    table: '$6/sdds_application_sdds_site_sdds_site/$ref'
  }),
  expect.objectContaining({
    assignments: {
      '@odata.id': '$3'
    },
    contentId: 9,
    method: 'POST',
    table: '$6/sdds_application_sdds_site_sdds_site/$ref'
  })
]

export const expectedApplicationRequestPath = 'sdds_applications?$select=sdds_applicationnumber,sdds_descriptionofproposal,sdds_detailsofconvictions,sdds_whydoyouneedalicence,sdds_applicationcategory&$expand=sdds_applicantid($select=firstname,lastname,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_organisationid($select=name,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_ecologistid($select=firstname,lastname,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_ecologistorganisationid($select=name,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_applicationtypesid($select=sdds_applicationname,sdds_description),sdds_applicationpurpose($select=sdds_name,sdds_description)'

export const applicationResponseObject = {
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

export const applicationResponseTransformedDataObject = {
  application: {
    applicant: {
      address: {
        addrline1: 'the grove',
        addrline2: 'henleaze',
        county: 'bristol',
        postcode: 'BS1',
        town: 'briz'
      },
      contactDetails: {
        email: 'me@email.com',
        phone: '16542'
      },
      firstname: 'Robert',
      lastname: 'Plant'
    },
    applicationCategory: 100000001,
    applicationPurpose: 'Keeping badgers in zoological gardens or collections',
    applicationType: 'A24 Badger',
    ecologist: {
      address: {
        addrline1: 'Old Hill',
        addrline2: 'Stapleton',
        addrline3: 'Nr. Bristol',
        county: 'Somerset',
        postcode: 'BS11',
        town: 'Bristol'
      },
      contactDetails: {
        email: 'ecologist1@email.com',
        phone: 'string'
      },
      firstname: 'Mr Brian',
      lastname: 'Ecologist',
      organization: {
        address: {
          addrline1: 'a1',
          addrline2: 'a2',
          addrline3: 'a3',
          county: 'c1',
          postcode: '876',
          town: 't1'
        },
        name: 'Ecologist1_Org'
      }
    },
    licenceReason: 'New hosuing development',
    proposalDescription: 'Removal of badgers by dogs'
  }
}
export const applicationResponseTransformedKeys = [
  {
    apiBasePath: 'application',
    apiKey: null,
    apiTable: 'applications',
    contentId: null,
    powerAppsKey: '8d797550-818a-ec11-93b0-0022481b4422',
    powerAppsTable: 'sdds_applications'
  },
  {
    apiBasePath: 'application.applicant',
    apiKey: null,
    apiTable: 'applications',
    contentId: null,
    powerAppsKey: '88797550-818a-ec11-93b0-0022481b4422',
    powerAppsTable: 'contacts'
  },
  {
    apiBasePath: 'application.ecologist',
    apiKey: null,
    apiTable: 'applications',
    contentId: null,
    powerAppsKey: '8a797550-818a-ec11-93b0-0022481b4422',
    powerAppsTable: 'contacts'
  },
  {
    apiBasePath: 'application.ecologist.organization',
    apiKey: null,
    apiTable: 'applications',
    contentId: null,
    powerAppsKey: '8c797550-818a-ec11-93b0-0022481b4422',
    powerAppsTable: 'accounts'
  }
]

export const applicationSiteResponseObject = {
  '@odata.etag': 'W/"3374599"',
  sdds_applicationid: '2b6759f9-268f-ec11-b400-000d3a8728b2',
  sdds_application_sdds_site_sdds_site: [
    {
      '@odata.etag': 'W/"3374594"',
      sdds_siteid: '286759f9-268f-ec11-b400-000d3a8728b2',
      statecode: 0
    },
    {
      '@odata.etag': 'W/"3374595"',
      sdds_siteid: 'd0d79386-fd8f-ec11-b400-000d3a872ae7',
      statecode: 0
    }
  ],
  'sdds_application_sdds_site_sdds_site@odata.nextLink': 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0/sdds_applications(2b6759f9-268f-ec11-b400-000d3a8728b2)/sdds_application_sdds_site_sdds_site?$select=sdds_siteid,statecode'
}

export const applicationSiteResponseTransformedDataObject = {
  application: {
    id: '2b6759f9-268f-ec11-b400-000d3a8728b2',
    sites: [
      {
        id: '286759f9-268f-ec11-b400-000d3a8728b2'
      },
      {
        id: 'd0d79386-fd8f-ec11-b400-000d3a872ae7'
      }
    ]
  }
}

export const applicationSiteResponseTransformedKeys = [
  {
    apiBasePath: 'application',
    apiKey: null,
    apiTable: 'applications',
    contentId: null,
    powerAppsKey: '2b6759f9-268f-ec11-b400-000d3a8728b2',
    powerAppsTable: 'sdds_applications'
  },
  {
    apiBasePath: 'application.sites',
    apiKey: null,
    apiTable: 'sites',
    contentId: null,
    powerAppsKey: '286759f9-268f-ec11-b400-000d3a8728b2',
    powerAppsTable: 'sdds_sites'
  },
  {
    apiBasePath: 'application.sites',
    apiKey: null,
    apiTable: 'sites',
    contentId: null,
    powerAppsKey: 'd0d79386-fd8f-ec11-b400-000d3a872ae7',
    powerAppsTable: 'sdds_sites'
  }
]

// Stops the jest runner flagging this file as an error
it('example data for schema processor tests', async () => {})
