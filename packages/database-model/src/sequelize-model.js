import { SEQUELIZE } from '@defra/wls-connectors-lib'
import db from 'debug'

const { DataTypes, QueryTypes } = SEQUELIZE
const debug = db('database-model:define')

const models = {}

async function defineUserRoles (sequelize) {
  models.userRoles = await sequelize.define('user-roles', {
    role: { type: DataTypes.STRING(20), primaryKey: true }
  }, {
    timestamps: false,
    indexes: [
      { unique: true, fields: ['role'], name: 'user_roles_uk' }
    ]
  })
}

async function defineContactRoles (sequelize) {
  models.contactRoles = await sequelize.define('contact-roles', {
    contactRole: { type: DataTypes.STRING(30), primaryKey: true }
  }, {
    timestamps: false,
    indexes: [
      { unique: true, fields: ['contact_role'], name: 'contact_roles_uk' }
    ]
  })
}

async function defineAccountRoles (sequelize) {
  models.accountRoles = await sequelize.define('account-roles', {
    accountRole: { type: DataTypes.STRING(30), primaryKey: true }
  }, {
    timestamps: false,
    indexes: [
      { unique: true, fields: ['account_role'], name: 'account_roles_uk' }
    ]
  })
}

async function defineUsers (sequelize) {
  models.users = await sequelize.define('user', {
    id: { type: DataTypes.UUID, primaryKey: true },
    username: { type: DataTypes.STRING(50), allowNull: false }
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['username'], name: 'user_username_uk' }
    ]
  })
}

async function defineContacts (sequelize) {
  models.contacts = await sequelize.define('contacts', {
    id: { type: DataTypes.UUID, primaryKey: true },
    contact: { type: DataTypes.JSONB },
    sddsContactId: { type: DataTypes.UUID },
    submitted: { type: DataTypes.DATE },
    updateStatus: { type: DataTypes.STRING(1), allowNull: false }
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['sdds_contact_id'], name: 'contact_sdds_id_uk' }
    ]
  })
}

async function defineAccounts (sequelize) {
  models.accounts = await sequelize.define('accounts', {
    id: { type: DataTypes.UUID, primaryKey: true },
    account: { type: DataTypes.JSONB },
    sddsAccountId: { type: DataTypes.UUID },
    submitted: { type: DataTypes.DATE },
    updateStatus: { type: DataTypes.STRING(1), allowNull: false }
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['sdds_account_id'], name: 'account_sdds_id_uk' }
    ]
  })
}

async function defineSites (sequelize) {
  models.sites = await sequelize.define('sites', {
    id: { type: DataTypes.UUID, primaryKey: true },
    site: { type: DataTypes.JSONB },
    sddsSiteId: { type: DataTypes.UUID },
    submitted: { type: DataTypes.DATE },
    updateStatus: { type: DataTypes.STRING(1), allowNull: false }
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['sdds_site_id'], name: 'site_sdds_id_uk' }
    ]
  })
}

async function defineHabitatSites (sequelize) {
  models.habitatSites = await sequelize.define('habitat-sites', {
    id: { type: DataTypes.UUID, primaryKey: true },
    applicationId: {
      type: DataTypes.UUID,
      references: {
        model: models.applications,
        key: 'id'
      }
    },
    habitatSite: { type: DataTypes.JSONB },
    sddsHabitatSiteId: { type: DataTypes.UUID },
    submitted: { type: DataTypes.DATE },
    updateStatus: { type: DataTypes.STRING(1), allowNull: false }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['application_id'], name: 'habitat_site_application_fk' }
    ]
  })
}

async function defineApplications (sequelize) {
  models.applications = await sequelize.define('applications', {
    id: { type: DataTypes.UUID, primaryKey: true },
    application: { type: DataTypes.JSONB },
    sddsApplicationId: { type: DataTypes.UUID },
    submitted: { type: DataTypes.DATE },
    updateStatus: { type: DataTypes.STRING(1), allowNull: false }
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['sdds_application_id'], name: 'application_sdds_id_uk' }
    ]
  })
}

async function defineApplicationUsers (sequelize) {
  models.applicationUsers = await sequelize.define('application-users', {
    id: { type: DataTypes.UUID, primaryKey: true },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: models.users,
        key: 'id'
      }
    },
    applicationId: {
      type: DataTypes.UUID,
      references: {
        model: models.applications,
        key: 'id'
      }
    },
    role: {
      type: DataTypes.STRING(20),
      references: {
        model: models.userRoles,
        key: 'role'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['user_id'], name: 'application_user_user_fk' },
      { unique: false, fields: ['application_id'], name: 'application_user_application_fk' },
      { unique: false, fields: ['role'], name: 'application_user_role_fk' }
    ]
  })
}

async function defineApplicationContacts (sequelize) {
  models.applicationContacts = await sequelize.define('application-contacts', {
    id: { type: DataTypes.UUID, primaryKey: true },
    applicationId: {
      type: DataTypes.UUID,
      references: {
        model: models.applications,
        key: 'id'
      }
    },
    contactId: {
      type: DataTypes.UUID,
      references: {
        model: models.contacts,
        key: 'id'
      }
    },
    contactRole: {
      type: DataTypes.STRING(30),
      references: {
        model: models.contactRoles,
        key: 'contact_role'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['application_id', 'contact_id', 'contact_role'], name: 'application_contact_uk' },
      { unique: false, fields: ['application_id'], name: 'application_contact_application_fk' },
      { unique: false, fields: ['contact_id'], name: 'application_contact_contact_fk' },
      { unique: false, fields: ['contact_role'], name: 'application_contact_role_fk' }
    ]
  })
}

async function defineApplicationAccounts (sequelize) {
  models.applicationAccounts = await sequelize.define('application-accounts', {
    id: { type: DataTypes.UUID, primaryKey: true },
    applicationId: {
      type: DataTypes.UUID,
      references: {
        model: models.applications,
        key: 'id'
      }
    },
    accountId: {
      type: DataTypes.UUID,
      references: {
        model: models.accounts,
        key: 'id'
      }
    },
    accountRole: {
      type: DataTypes.STRING(30),
      references: {
        model: models.accountRoles,
        key: 'account_role'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['application_id', 'account_id', 'account_role'], name: 'application_account_uk' },
      { unique: false, fields: ['application_id'], name: 'application_account_application_fk' },
      { unique: false, fields: ['account_id'], name: 'application_account_account_fk' },
      { unique: false, fields: ['account_role'], name: 'application_account_role_fk' }
    ]
  })
}

async function defineApplicationSites (sequelize) {
  models.applicationSites = await sequelize.define('application-sites', {
    id: { type: DataTypes.UUID, primaryKey: true },
    applicationId: {
      type: DataTypes.UUID,
      references: {
        model: models.applications,
        key: 'id'
      }
    },
    siteId: {
      type: DataTypes.UUID,
      references: {
        model: models.sites,
        key: 'id'
      }
    },
    sddsApplicationId: { type: DataTypes.UUID },
    sddsSiteId: { type: DataTypes.UUID }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['application_id'], name: 'application_site_application_fk' },
      { unique: false, fields: ['site_id'], name: 'application_site_site_fk' },
      { unique: true, fields: ['application_id', 'site_id'], name: 'application_site_uk' },
      { unique: true, fields: ['sdds_application_id', 'sdds_site_id'], name: 'sdds_application_site_uk' }
    ]
  })
}

const ReferenceDataType = {
  attributes: {
    id: { type: DataTypes.UUID, primaryKey: true },
    json: { type: DataTypes.JSONB }
  },
  options: {
    timestamps: true
  }
}

async function defineApplicationTypes (sequelize) {
  models.applicationTypes = await sequelize.define('application-types', ReferenceDataType.attributes, ReferenceDataType.options)
}

async function defineApplicationPurposes (sequelize) {
  models.applicationPurposes = await sequelize.define('application-purposes', ReferenceDataType.attributes, ReferenceDataType.options)
}

async function defineActivities (sequelize) {
  models.activities = await sequelize.define('activities', ReferenceDataType.attributes, ReferenceDataType.options)
}

async function defineMethods (sequelize) {
  models.methods = await sequelize.define('methods', ReferenceDataType.attributes, ReferenceDataType.options)
}

async function defineSpecies (sequelize) {
  models.species = await sequelize.define('species', ReferenceDataType.attributes, ReferenceDataType.options)
}

async function activityMethods (sequelize) {
  models.activityMethods = await sequelize.define('activity-methods', {
    activityId: {
      type: DataTypes.UUID,
      references: { model: models.activities, key: 'id' }
    },
    methodId: {
      type: DataTypes.UUID,
      references: { model: models.methods, key: 'id' }
    }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['activity_id'], name: 'activity_methods_activity_fk' },
      { unique: false, fields: ['method_id'], name: 'activity_methods_method_fk' }
    ]
  })
}

async function applicationTypeActivities (sequelize) {
  models.applicationTypeActivities = await sequelize.define('application-type-activities', {
    applicationTypeId: {
      type: DataTypes.UUID,
      references: { model: models.applicationTypes, key: 'id' }
    },
    activityId: {
      type: DataTypes.UUID,
      references: { model: models.activities, key: 'id' }
    }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['application_type_id'], name: 'application_type_activities_application_type_fk' },
      { unique: false, fields: ['activity_id'], name: 'application_type_activities_activities_fk' }
    ]
  })
}

async function applicationTypeSpecies (sequelize) {
  models.applicationTypeSpecies = await sequelize.define('application-type-species', {
    applicationTypeId: {
      type: DataTypes.UUID,
      references: { model: models.applicationTypes, key: 'id' }
    },
    speciesId: {
      type: DataTypes.UUID,
      references: { model: models.species, key: 'id' }
    }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['application_type_id'], name: 'application_type_species_application_type_fk' },
      { unique: false, fields: ['species_id'], name: 'application_type_species_species_fk' }
    ]
  })
}

async function applicationTypeApplicationPurposes (sequelize) {
  models.applicationTypeApplicationPurposes = await sequelize.define('application-type-application-purposes', {
    applicationTypeId: {
      type: DataTypes.UUID,
      references: { model: models.applicationTypes, key: 'id' }
    },
    applicationPurposeId: {
      type: DataTypes.UUID,
      references: { model: models.applicationPurposes, key: 'id' }
    }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['application_type_id'], name: 'application_type_application_purpose_application_type_fk' },
      { unique: false, fields: ['application_purpose_id'], name: 'application_type_application_purpose_application_purpose_fk' }
    ]
  })
}

async function defineOptionSets (sequelize) {
  models.optionSets = await sequelize.define('option-sets', {
    name: { type: DataTypes.STRING(100), primaryKey: true },
    json: { type: DataTypes.JSONB }
  }, {
    timestamps: true
  })
}

async function defineApplicationRefSeq (sequelize) {
  await sequelize.query('CREATE SEQUENCE IF NOT EXISTS application_ref_seq START  WITH  500000 CACHE 100;')
  models.getApplicationRef = () => sequelize.query('select nextval(\'application_ref_seq\')', { type: QueryTypes.SELECT })
}

const createModels = async () => {
  const sequelize = SEQUELIZE.getSequelize()

  // Define the tables
  await defineUsers(sequelize)
  await defineUserRoles(sequelize)

  // Define the account and contact tables
  await defineContactRoles(sequelize)
  await defineAccountRoles(sequelize)
  await defineContacts(sequelize)
  await defineAccounts(sequelize)

  // Define te applications and sites
  await defineApplications(sequelize)
  await defineSites(sequelize)
  await defineHabitatSites(sequelize)

  await defineApplicationUsers(sequelize)

  await defineApplicationSites(sequelize)
  await defineApplicationContacts(sequelize)
  await defineApplicationAccounts(sequelize)

  // Define other things
  await defineApplicationTypes(sequelize)
  await defineApplicationPurposes(sequelize)
  await defineActivities(sequelize)
  await defineMethods(sequelize)
  await defineSpecies(sequelize)
  await activityMethods(sequelize)
  await applicationTypeActivities(sequelize)
  await applicationTypeSpecies(sequelize)
  await applicationTypeApplicationPurposes(sequelize)

  await defineOptionSets(sequelize)
  await defineApplicationRefSeq(sequelize)

  // Create M:M associations (it does not seem to want to create the junction tables automatically)
  // users <> applications
  models.users.belongsToMany(models.applications, { through: models.applicationUsers })
  models.applications.belongsToMany(models.users, { through: models.applicationUsers })

  // activities <> methods
  models.activities.belongsToMany(models.methods, { through: models.activityMethods })
  models.methods.belongsToMany(models.activities, { through: models.activityMethods })

  // Application type <> activities
  models.applicationTypes.belongsToMany(models.activities, { through: models.applicationTypeActivities })
  models.activities.belongsToMany(models.applicationTypes, { through: models.applicationTypeActivities })

  // Application type <> species
  models.applicationTypes.belongsToMany(models.species, { through: models.applicationTypeSpecies })
  models.species.belongsToMany(models.applicationTypes, { through: models.applicationTypeSpecies })

  // Application type <> purposes
  models.applicationTypes.belongsToMany(models.applicationPurposes, { through: models.applicationTypeApplicationPurposes })
  models.applicationPurposes.belongsToMany(models.applicationTypes, { through: models.applicationTypeApplicationPurposes })

  // Synchronize the model
  await models.users.sync()
  await models.userRoles.sync()

  await models.contactRoles.sync()
  await models.accountRoles.sync()
  await models.contacts.sync()
  await models.accounts.sync()

  await models.applications.sync()
  await models.habitatSites.sync()
  await models.sites.sync()

  await models.applicationUsers.sync()

  await models.applicationSites.sync()
  await models.applicationContacts.sync()
  await models.applicationAccounts.sync()

  await models.applicationTypes.sync()
  await models.applicationPurposes.sync()
  await models.activities.sync()
  await models.methods.sync()
  await models.species.sync()
  await models.activityMethods.sync()
  await models.applicationTypeActivities.sync()
  await models.applicationTypeSpecies.sync()
  await models.applicationTypeApplicationPurposes.sync()

  await models.optionSets.sync()

  // Create user roles
  await models.userRoles.upsert({ role: 'USER' })

  // Create the contact roles
  await models.contactRoles.upsert({ contactRole: 'APPLICANT' })
  await models.contactRoles.upsert({ contactRole: 'ECOLOGIST' })
  await models.contactRoles.upsert({ contactRole: 'NAMED-INDIVIDUAL' })
  await models.accountRoles.upsert({ accountRole: 'APPLICANT-ORGANISATION' })
  await models.accountRoles.upsert({ accountRole: 'ECOLOGIST-ORGANISATION' })

  debug('Created database model')
}

export { models, createModels }
