import Joi from "joi";

const completeProfileSchema = Joi.object({
    role: Joi.string().required(),
    basicInfo: Joi.object({
        name: Joi.string().required(),
        profilePicture: Joi.string().uri().optional(),
        contact: Joi.string().required(),
        alternateContact: Joi.string().optional(),
        // isVerified: Joi.boolean().optional(),
    }).required(),
    address: Joi.object({
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        zipCode: Joi.string().required(),
        fullAddress: Joi.string().required(),
        coordinates: Joi.object({
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
        }).required(),
    }).required(),
    additionalDetails: Joi.object({
        description: Joi.string().optional(),
    }).optional(),
    // contributorSpecific: Joi.object({
    //     contributedFoodItems: Joi.array().items(Joi.string()).optional(),
    //     donations: Joi.array().items(Joi.string()).optional(),
    // }).optional(),
    ngoSpecific: Joi.object({
        ngoDetails: Joi.object({
            registrationNumber: Joi.string().optional(),
            ntnNumber: Joi.string().optional(),
            certificateURL: Joi.string().uri().optional(),
        }).optional(),
        // managedDonations: Joi.array().items(Joi.string()).optional(),
    }).optional(),
});

export { completeProfileSchema };