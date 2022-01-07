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
    submitted: {
      type: DataTypes.DATE
    }
  }, {
    timestamps: true,
    indexes: [{ unique: false, fields: ['user_id'], name: 'application_user_fk' }]
  })

  await models.users.sync()
  await models.applications.sync()
}

export { models, createModels }
