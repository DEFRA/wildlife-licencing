import { SEQUELIZE } from '@defra/wls-connectors-lib'
import pkg from 'sequelize'
const { DataTypes } = pkg

const models = {}

const createModels = async () => {
  const sequelize = SEQUELIZE.getSequelize()
  models.users = await sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    }
  }, {
    timestamps: true
  })

  models.applications = await sequelize.define('applications', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: models.users,
        key: 'id'
      }
    },
    application: {
      type: DataTypes.JSONB
    },
    targetKeys: {
      type: DataTypes.JSONB
    },
    sddsApplicationId: {
      type: DataTypes.UUID
    },
    submitted: {
      type: DataTypes.DATE
    },
    updateStatus: {
      type: DataTypes.STRING(1),
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      { unique: false, fields: ['user_id'], name: 'application_user_fk' },
      { unique: true, fields: ['sdds_application_id'], name: 'application_sdds_id_uk' }
    ]
  })

  models.applicationTypes = await sequelize.define('application-types', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    json: {
      type: DataTypes.JSONB
    }
  }, {
    timestamps: true
  })

  models.applicationPurposes = await sequelize.define('application-purposes', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    json: {
      type: DataTypes.JSONB
    }
  }, {
    timestamps: true
  })

  await models.users.sync()
  await models.applications.sync()
  await models.applicationTypes.sync()
  await models.applicationPurposes.sync()
}

export { models, createModels }
