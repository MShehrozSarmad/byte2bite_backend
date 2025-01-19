import Joi from "joi";

const foodItemSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    quantity: Joi.number().required(),
    expirationDate: Joi.date().required(),
    location: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
    }).required(),
});

export { foodItemSchema };