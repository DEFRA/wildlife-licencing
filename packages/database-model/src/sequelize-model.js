import { SEQUELIZE } from '@defra/wls-connectors-lib'
import pkg from 'sequelize'
const { DataTypes, QueryTypes } = pkg

const models = {}

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

async function defineSites (sequelize) {
  models.sites = await sequelize.define('sites', {
    id: { type: DataTypes.UUID, primaryKey: true },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: models.users,
        key: 'id'
      }
    },
    site: { type: DataTypes.JSONB },
    targetKeys: { type: DataTypes.JSONB },
    sddsSiteId: { type: DataTypes.UUID },
    submitted: { type: DataTypes.DATE },
    updateStatus: { type: DataTypes.STRING(1), allowNull: false }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['user_id'], name: 'site_user_fk' },
      { unique: true, fields: ['sdds_site_id'], name: 'site_sdds_id_uk' }
    ]
  })
}

async function defineApplications (sequelize) {
  models.applications = await sequelize.define('applications', {
    id: { type: DataTypes.UUID, primaryKey: true },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: models.users,
        key: 'id'
      }
    },
    application: { type: DataTypes.JSONB },
    targetKeys: { type: DataTypes.JSONB },
    sddsApplicationId: { type: DataTypes.UUID },
    submitted: { type: DataTypes.DATE },
    updateStatus: { type: DataTypes.STRING(1), allowNull: false }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['user_id'], name: 'application_user_fk' },
      { unique: true, fields: ['sdds_application_id'], name: 'application_sdds_id_uk' }
    ]
  })
}

async function defineApplicationSites (sequelize) {
  models.applicationSites = await sequelize.define('application-sites', {
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
      { unique: false, fields: ['user_id'], name: 'application_site_user_fk' },
      { unique: false, fields: ['application_id'], name: 'application_site_application_fk' },
      { unique: false, fields: ['site_id'], name: 'application_site_site_fk' },
      { unique: true, fields: ['user_id', 'application_id', 'site_id'], name: 'application_site_uk' },
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
  await defineUsers(sequelize)
  await defineSites(sequelize)
  await defineApplications(sequelize)
  await defineApplicationSites(sequelize)
  await defineApplicationTypes(sequelize)
  await defineApplicationPurposes(sequelize)
  await defineOptionSets(sequelize)
  await defineApplicationRefSeq(sequelize)

  await models.users.sync()
  await models.sites.sync()
  await models.applications.sync()
  await models.applicationSites.sync()
  await models.applicationTypes.sync()
  await models.applicationPurposes.sync()
  await models.optionSets.sync()
}

export { models, createModels }
