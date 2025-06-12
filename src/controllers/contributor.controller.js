import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { FoodItem } from "../models/foodItem.model.js";
import { foodItemSchema } from "../validators/fooditem.validator.js";
import { Contribution } from "../models/contribution.model.js";
import { Notification } from "../models/notification.model.js";
import { ContributionService } from "../services/contribution.service.js";

const overview = asyncHandler(async (req, res) => {
    console.log("on the overview dashboard");
    res.send("contratulation you are at dashboard");
});

const addFood = asyncHandler(async (req, res) => {
    console.log("running add food controller");
    const user = req.user;

    const { error, value } = foodItemSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    value.contributor = user._id;

    console.log(value);

    const response = await FoodItem.create(value);
    const foodID = response._id;

    user.details.contributorSpecific.contributedFoodItems.push(foodID);
    user.save();

    res.status(200).json(
        new ApiResponse(200, response, "food item listed successfully")
    );
});

const getFoodItem = asyncHandler(async (req, res) => {
    const { foodId } = req.body;
    console.log(foodId);

    if (!foodId) throw new ApiError(400, "food id is required");

    const food = await FoodItem.findOne({
        _id: foodId,
        contributor: req.user._id,
    }).populate("contributor", "-refreshToken -password");

    if (!food) throw new ApiError(400, "food item not found");

    res.status(200).json(
        new ApiResponse(200, food, "food item data fetched successfully")
    );
});

// const getFoodItemsAvailable = asyncHandler(async(req, res) => {

// });

// const getFoodItemsDonated = asyncHandler(async(req, res) => {

// });

const getFoodItems = asyncHandler(async (req, res) => {
    // const food = await FoodItem.find().populate(
    //     "contributor",
    //     "-refreshToken -password"
    // );

    const user = req.user;
    const food = await FoodItem.find({ contributor: user._id });
    // const food = await FoodItem.find({ contributor: user._id }).populate(
    //     "contributor",
    //     "-refreshToken -password"
    // );

    if (food.length == 0) throw new ApiError(400, "no food is listed");

    res.status(200).json(
        new ApiResponse(200, food, "food items data fetched successfully")
    );
});

const updateStatusCont = asyncHandler(async (req, res) => {
    const { contribution, status } = req.body;
    const user = req.user;

    const allowedStatus = ["accepted", "rejected", "cancelled"];

    if (!status || !contribution)
        throw new ApiError(400, "contribution and status is required");

    if (!allowedStatus.includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    await ContributionService.updateStatus(contribution, status, user);

    res.status(200).json(
        new ApiResponse(200, null, "status updated successfully")
    );
});

export { overview, addFood, getFoodItem, getFoodItems, updateStatusCont };
