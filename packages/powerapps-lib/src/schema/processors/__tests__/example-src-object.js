export const srcObj = {
  application: {
    data: {
      id: 'c4d14353-028d-45d1-adcd-576a2386b3d1',
      applicationReferenceNumber: '2022-500000-EPS-MIT',
      proposalDescription: 'Badgers are proposed to be moved',
      isRelatedConviction: true,
      detailsOfConvictions: 'no convictions',
      licenceReason: 'need to move some badgers',
      applicationCategory: 100000001,
      applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
      applicationPurposeId: '256f23ef-9775-ec11-8943-0022481aacb0'
    },
    keys: {
      apiKey: 'c4d14353-028d-45d1-adcd-576a2386b3d1',
      sddsKey: null
    },
    applicant: {
      data: {
        fullName: 'Bob Slaigh',
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
      keys: {
        apiKey: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
        sddsKey: null
      }
    },
    sites: [
      {
        data: {
          name: 'The badger set 1',
          address: {
            houseNumber: 'The fields',
            addressLine1: 'Winscombe',
            county: 'Somerset',
            postcode: 'bs21 2XX'
          },
          gridReference: '7868962'
        },
        keys: {
          apiKey: '842fc15b-2858-4349-86ea-b33a0629a30b',
          sddsKey: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb'
        }
      },
      {
        data: {
          name: 'The badger set 2',
          address: {
            houseNumber: 'The fields',
            addressLine1: 'Winscombe',
            addressLine2: null, // Explicit set of null
            county: 'Somerset',
            postcode: 'bs22 2XX'
          },
          gridReference: '7868962'
        },
        keys: {
          apiKey: '15385397-6df3-45f8-9c98-4551815bbfa0',
          sddsKey: null
        }
      },
      {
        data: {
          name: 'The badger set 3',
          address: {
            houseNumber: 'The fields',
            addressLine1: 'Winscombe',
            county: 'Somerset',
            postcode: 'bs23 2XX'
          },
          gridReference: '786896'
        },
        keys: {
          apiKey: '27e20450-f414-445e-995b-8d7caf53ab2c',
          sddsKey: null
        }
      }
    ]
  }
}

export const singleEndedSrcExample = {
  habitatSite: {
    methods: [
      {
        keys: {
          sddsKey: 'f8a385c9-58ed-ec11-bb3c-000d3a0cee24'
        }
      }
    ],
    data: {
      name: 'Sett 2',
      active: true,
      settType: 100000002,
      speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
      activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24',
      speciesSubjectId: '60ce79d8-87fb-ec11-82e5-002248c5c45b'
    },
    keys: {
      apiKey: 'a14aad7f-26e5-491c-bdf8-969d255be0ef',
      sddsKey: '8c229893-9fc8-ed11-b596-6045bd0b98a9'
    }
  }
}

export const singleEndedSrcExample2 = {
  application: {
    data: {
    },
    keys: {
      apiKey: 'ec4521f1-8a46-471d-bef0-702d73ba654e',
      sddsKey: 'c88c9799-9fc8-ed11-b596-6045bd0b98a9'
    },
    habitatSites: [
      {
        methods: [
          {
            keys: {
              sddsKey: 'f8a385c9-58ed-ec11-bb3c-000d3a0cee24'
            }
          },
          {
            keys: {
              sddsKey: '315af0cf-58ed-ec11-bb3c-000d3a0cee24'
            }
          },
          {
            keys: {
              sddsKey: '3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24'
            }
          }
        ],
        data: {
          name: 'Sett 1'
        },
        keys: {
          apiKey: 'ecdc977e-e75f-4ee6-bf47-fcd98cae1167',
          sddsKey: '92229893-9fc8-ed11-b596-6045bd0b98a9'
        }
      },
      {
        methods: [
          {
            keys: {
              sddsKey: 'f8a385c9-58ed-ec11-bb3c-000d3a0cee24'
            }
          }
        ],
        data: {
          name: 'Sett 2'
        },
        keys: {
          apiKey: '1e2fdd44-f642-40bc-b7bf-c97fb766479b',
          sddsKey: '8c229893-9fc8-ed11-b596-6045bd0b98a9'
        }
      }
    ]
  }
}

export const initialGeneratedAssignmentsObject = [
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
    assignments: {
      'sdds_applicantid@odata.bind': '$4',
      'sdds_applicationtypesid@odata.bind': '/sdds_applicationtypeses(9d62e5b8-9c77-ec11-8d21-000d3a87431b)',
      'sdds_applicationpurpose@odata.bind': '/sdds_applicationpurposes(256f23ef-9775-ec11-8943-0022481aacb0)',
      sdds_applicationcategory: 100000001,
      sdds_sourceremote: true,
      sdds_applicationnumber: '2022-500000-EPS-MIT',
      sdds_descriptionofproposal: 'Badgers are proposed to be moved',
      sdds_wildliferelatedconviction: true,
      sdds_detailsofconvictions: 'no convictions',
      sdds_whydoyouneedalicence: 'need to move some badgers'
    },
    contentId: 5,
    method: 'POST',
    table: 'sdds_applications'
  }),
  expect.objectContaining({
    assignments: {
      '@odata.id': '$1'
    },
    contentId: 6,
    method: 'POST',
    table: '$5/sdds_application_sdds_site_sdds_site/$ref'
  }),
  expect.objectContaining({
    assignments: {
      '@odata.id': '$2'
    },
    contentId: 7,
    method: 'POST',
    table: '$5/sdds_application_sdds_site_sdds_site/$ref'
  }),
  expect.objectContaining({
    assignments: {
      '@odata.id': '$3'
    },
    contentId: 8,
    method: 'POST',
    table: '$5/sdds_application_sdds_site_sdds_site/$ref'
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
      sdds_applicationnumber: '2022-500000-EPS-MIT',
      'sdds_applicationpurpose@odata.bind': '/sdds_applicationpurposes(001)',
      'sdds_applicationtypesid@odata.bind': '/sdds_applicationtypeses(001)',
      sdds_descriptionofproposal: 'Badgers are proposed to be moved',
      sdds_wildliferelatedconviction: true,
      sdds_detailsofconvictions: 'no convictions',
      sdds_sourceremote: true,
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

export const expectedApplicationRequestPath = 'sdds_applications?$select=sdds_sourceremote,sdds_applicationnumber,sdds_descriptionofproposal,sdds_wildliferelatedconviction,sdds_detailsofconvictions,sdds_whydoyouneedalicence,sdds_applicationcategory,sdds_badgerreasonforexemption,sdds_otherreasonforexemption,sdds_licenceexempted,sdds_nsiproject,sdds_onnexttodesignatedsite,sdds_referenceorpurchaseordernumber,sdds_isapplicantonwnerofland,sdds_ownerpermissionreceived,sdds_doestheprojectneedanypermissions,sdds_projectpermissionsgranted,sdds_badgermitigationclasslicence,sdds_heldbadgerlicence,sdds_ecologistexperienceofmethods,sdds_ecologistexperienceofbadgerecology,sdds_mitigationclassrefno,sdds_whynopermissionrequired,sdds_nopermissionrequiredother,sdds_conflictsbtwappotherlegalcommitment,sdds_describethepotentialconflicts,sdds_otherprotectedspeciecommitment,sdds_yesotherprotectedspeciecommitment,statuscode&$filter=sdds_sourceremote eq true&$expand=sdds_applicationtypesid($select=sdds_applicationname,sdds_description,sdds_appsuffix;$expand=sdds_applicationtypes_sdds_applicationpur($select=sdds_applicationpurposeid)),sdds_applicationpurpose($select=sdds_applicationpurposeid),sdds_applicantid($select=contactid),sdds_organisationid($select=accountid),sdds_ecologistid($select=contactid),sdds_ecologistorganisationid($select=accountid),sdds_alternativeapplicantcontactid($select=contactid),sdds_alternativeecologistcontactid($select=contactid),sdds_billingcustomerid($select=contactid),sdds_billingorganisationid($select=accountid),sdds_application_Contact_Authorisedpersons($select=contactid)'

export const applicationResponseObject = {
  '@odata.context': 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0/$metadata#sdds_applications(sdds_applicationnumber,sdds_descriptionofproposal,sdds_detailsofconvictions,sdds_whydoyouneedalicence,sdds_applicationcategory,,sdds_isapplicantonwnerofland,sdds_receivedonwerpermission,sdds_doestheprojectneedanypermissions,sdds_projectpermissionsgranted,sdds_applicantid(lastname,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_organisationid(name,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_ecologistid(lastname,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_ecologistorganisationid(name,telephone1,emailaddress1,address1_line1,address1_line2,address1_line3,address1_county,address1_city,address1_postalcode),sdds_applicationtypesid(sdds_applicationname,sdds_description),sdds_applicationpurpose(sdds_name,sdds_description))/$entity',
  '@odata.etag': 'W/"3285321"',
  sdds_applicationnumber: '2022-500000-EPS-MIT',
  sdds_descriptionofproposal: 'Removal of badgers by dogs',
  sdds_wildliferelatedconviction: false,
  sdds_detailsofconvictions: null,
  sdds_whydoyouneedalicence: 'New hosuing development',
  sdds_applicationcategory: 100000001,
  sdds_applicationid: '8d797550-818a-ec11-93b0-0022481b4422',
  sdds_applicantid: {
    '@odata.etag': 'W/"3285313"',
    lastname: 'Robert Plant',
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
    lastname: 'Mr Brian Ecologist',
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
    sdds_applicationtypesid: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
  },
  sdds_applicationpurpose: {
    sdds_applicationpurposeid: '81bbe720-9975-ec11-8943-0022481aacb0'
  }
}

export const applicationResponseTransformedDataObject = {
  application: {
    applicant: {
      address: {
        county: 'bristol',
        locality: 'henleaze',
        postcode: 'BS1',
        street: 'the grove',
        town: 'briz',
        addressLine1: 'the grove',
        addressLine2: 'henleaze'
      },
      contactDetails: {
        email: 'me@email.com',
        phoneNumber: "16542"
      },
      fullName: 'Robert Plant'
    },
    applicationCategory: 100000001,
    applicationReferenceNumber: '2022-500000-EPS-MIT',
    ecologist: {
      address: {
        county: 'Somerset',
        dependentLocality: 'Nr. Bristol',
        locality: 'Stapleton',
        addressLine1: 'Old Hill',
        addressLine2: 'Stapleton',
        postcode: 'BS11',
        street: 'Old Hill',
        town: 'Bristol'
      },
      contactDetails: {
        email: 'ecologist1@email.com',
        phoneNumber: 'string'
      },
      fullName: 'Mr Brian Ecologist'
    },
    ecologistOrganization: {
      address: {
        county: 'c1',
        dependentLocality: 'a3',
        locality: 'a2',
        postcode: '876',
        addressLine1: 'a1',
        addressLine2: 'a2',
        street: 'a1',
        town: 't1'
      },
      name: 'Ecologist1_Org'
    },
    eligibility: {
      hasLandOwnerPermission: false
    },
    isRelatedConviction: false,
    licenceReason: 'New hosuing development',
    onOrNextToDesignatedSite: false,
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
    apiBasePath: 'application.applicationTypeId',
    apiKey: null,
    apiTable: 'applicationTypes',
    contentId: null,
    powerAppsKey: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
    powerAppsTable: 'sdds_applicationtypeses'
  },
  {
    apiBasePath: 'application.applicationPurposeId',
    apiKey: null,
    apiTable: 'applicationPurposes',
    contentId: null,
    powerAppsKey: '81bbe720-9975-ec11-8943-0022481aacb0',
    powerAppsTable: 'sdds_applicationpurposes'
  },
  {
    apiBasePath: 'application.applicant',
    apiKey: null,
    apiTable: 'contacts',
    contentId: null,
    powerAppsKey: '88797550-818a-ec11-93b0-0022481b4422',
    powerAppsTable: 'contacts'
  },
  {
    apiBasePath: 'application.ecologist',
    apiKey: null,
    apiTable: 'contacts',
    contentId: null,
    powerAppsKey: '8a797550-818a-ec11-93b0-0022481b4422',
    powerAppsTable: 'contacts'
  },
  {
    apiBasePath: 'application.ecologistOrganization',
    apiKey: null,
    apiTable: 'accounts',
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
      sdds_siteid: '286759f9-268f-ec11-b400-000d3a8728b2'
    },
    {
      '@odata.etag': 'W/"3374595"',
      sdds_siteid: 'd0d79386-fd8f-ec11-b400-000d3a872ae7'
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
