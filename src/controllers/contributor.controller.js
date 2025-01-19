import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { FoodItem } from "../models/foodItem.model.js";
import { foodItemSchema } from "../validators/fooditem.validator.js";

const overview = asyncHandler(async (req, res) => {
    console.log("on the overview dashboard");
    res.send("contratulation you are at dashboard");
});

const addFood = asyncHandler(async (req, res) => {
    console.log("running add food controller");

    const { error, value } = foodItemSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    value.contributor = req.user._id;
    console.log(value);
    const response = await FoodItem.create(value);
    res.status(200).json(
        new ApiResponse(200, response, "food item listed successfully")
    );
});

export { overview, addFood };
