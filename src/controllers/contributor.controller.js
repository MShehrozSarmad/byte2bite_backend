import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { FoodItem } from "../models/foodItem.model.js";
import { foodItemSchema } from "../validators/fooditem.validator.js";
import { Contribution } from "../models/contribution.model.js";
import { Notification } from "../models/notification.model.js";

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
    const { foodItem } = req.body;
    console.log(foodItem);

    if (!foodItem) throw new ApiError(400, "food id is required");

    const food = await FoodItem.findById(foodItem).populate(
        "contributor",
        "-refreshToken -password"
    );

    if (!food) throw new ApiError(400, "no food is listed with this id");

    res.status(200).json(
        new ApiResponse(200, food, "food item data fetched successfully")
    );
});

// const getFoodItemsAvailable = asyncHandler(async(req, res) => {

// });

// const getFoodItemsDonated = asyncHandler(async(req, res) => {

// });

const getFoodItems = asyncHandler(async (_, res) => {
    const food = await FoodItem.find().populate(
        "contributor",
        "-refreshToken -password"
    );

    if (food.length == 0) throw new ApiError(400, "no food is listed");

    res.status(200).json(
        new ApiResponse(200, food, "food items data fetched successfully")
    );
});

const cont_stts_response = asyncHandler(async (req, res) => {
    const { contribution, status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const updatedReq = await Contribution.findByIdAndUpdate(
        contribution,
        {
            status,
        },
        { new: true }
    );

    if (!updatedReq) throw new ApiError(404, "Request not found");

    await Notification.create({
        recipient: updatedCont.ngo,
        type: "status update",
        contribution,
        message: `Your request has been ${status}`,
    });

    res.status(200).json(200, null, "status updated successfully");
});

const cont_stts_collected = asyncHandler(async (req, res) => {
    const { requestId } = req.body;

    if (!requestId)
        throw new ApiError(400, "Missing required fields: requestId");

    const updatedReq = await Contribution.findByIdAndUpdate(
        requestId,
        { status: "collected" },
        { new: true }
    );
    if (!updatedReq) throw new ApiError(404, "Request not found");

    await Notification.create({
        recipient: updatedReq.ngo,
        type: "status update",
        contribution: updatedReq._id,
        message: "Food collected.",
    });

    res.status(200).json(
        new ApiResponse(200, null, "status updated successfully")
    );
});

export {
    overview,
    addFood,
    getFoodItem,
    getFoodItems,
    cont_stts_response,
    cont_stts_collected,
};
