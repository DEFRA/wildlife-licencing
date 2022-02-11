import Joi from 'joi'

export const ApplicationSchema = Joi.object({
  id: Joi.string(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
  proposalDescription: Joi.string(),
  applicant: Joi.object(),
  detailsOfConvictions: Joi.string(),
  applicationType: Joi.string(),
  applicationPurpose: Joi.string(),
  applicationCategory: Joi.number(),
})

export const ApplicationsSchema = Joi.array().items(ApplicationSchema)
