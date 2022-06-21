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
    targetKeys: { type: DataTypes.JSONB },
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

async function defineApplications (sequelize) {
  models.applications = await sequelize.define('applications', {
    id: { type: DataTypes.UUID, primaryKey: true },
    application: { type: DataTypes.JSONB },
    targetKeys: { type: DataTypes.JSONB },
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

async function defineSiteUsers (sequelize) {
  models.siteUsers = await sequelize.define('site-users', {
    id: { type: DataTypes.UUID, primaryKey: true },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: models.users,
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
      { unique: false, fields: ['user_id'], name: 'site_user_user_fk' },
      { unique: false, fields: ['site_id'], name: 'site_user_site_fk' },
      { unique: false, fields: ['role'], name: 'site_user_role_fk' }
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

async function defineApplicationTypes (sequelize) {
  models.applicationTypes = await sequelize.define('application-types', {
    id: { type: DataTypes.UUID, primaryKey: true },
    json: { type: DataTypes.JSONB }
  }, {
    timestamps: true
  })
}

async function defineApplicationPurposes (sequelize) {
  models.applicationPurposes = await sequelize.define('application-purposes', {
    id: { type: DataTypes.UUID, primaryKey: true },
    json: { type: DataTypes.JSONB }
  }, {
    timestamps: true
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

  await defineApplicationUsers(sequelize)
  await defineSiteUsers(sequelize)

  await defineApplicationSites(sequelize)
  await defineApplicationContacts(sequelize)
  await defineApplicationAccounts(sequelize)

  // Define other things
  await defineApplicationTypes(sequelize)
  await defineApplicationPurposes(sequelize)
  await defineOptionSets(sequelize)
  await defineApplicationRefSeq(sequelize)

  // Create M:M associations
  // users <> applications
  models.users.belongsToMany(models.applications, { through: models.applicationUsers })
  models.applications.belongsToMany(models.users, { through: models.applicationUsers })

  // TODO remove this relationship
  models.sites.hasMany(models.siteUsers)

  // Synchronize the model
  await models.users.sync()
  await models.userRoles.sync()

  await models.contactRoles.sync()
  await models.accountRoles.sync()
  await models.contacts.sync()
  await models.accounts.sync()

  await models.applications.sync()
  await models.sites.sync()

  await models.applicationUsers.sync()
  await models.siteUsers.sync()

  await models.applicationSites.sync()
  await models.applicationContacts.sync()
  await models.applicationAccounts.sync()

  await models.applicationTypes.sync()
  await models.applicationPurposes.sync()
  await models.optionSets.sync()

  // Create user roles
  await models.userRoles.upsert({ role: 'USER' })

  // Create the contact roles
  await models.contactRoles.upsert({ contactRole: 'APPLICANT' })
  await models.contactRoles.upsert({ contactRole: 'ECOLOGIST' })
  await models.contactRoles.upsert({ contactRole: 'NAMED-INDIVIDUAL' })
  await models.accountRoles.upsert({ accountRole: 'APPLICANT-ORGANIZATION' })
  await models.accountRoles.upsert({ accountRole: 'ECOLOGIST-ORGANIZATION' })

  debug('Created database model')
}

export { models, createModels }
